import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 12);
    const verificationToken = Math.random().toString(36).substring(2, 15);

    const user = this.userRepository.create({
      email: registerDto.email,
      passwordHash,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      emailVerificationToken: verificationToken,
    });

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      userId: user.id,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['roles'],
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is locked');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      roles: user.roles?.map(r => r.name) || []
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Store refresh token
    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await this.refreshTokenRepository.save(refreshTokenEntity);

    // Reset failed attempts on successful login
    await this.userRepository.update(user.id, { failedLoginAttempts: 0 });

    return {
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        roles: user.roles,
        emailVerified: user.emailVerified,
        avatar: user.avatar,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = { sub: tokenRecord.userId, email: tokenRecord.user.email, role: tokenRecord.user.role };
    const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Update refresh token
    tokenRecord.token = newRefreshToken;
    tokenRecord.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepository.save(tokenRecord);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string) {
    await this.refreshTokenRepository.delete({ userId });
    return { success: true, message: 'Logged out successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email }
    });

    if (!user) {
      return { success: true, message: 'If email exists, reset link has been sent' };
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const passwordReset = this.passwordResetRepository.create({
      userId: user.id,
      token,
      expiresAt,
    });

    await this.passwordResetRepository.save(passwordReset);

    // In production, send email here
    console.log(`Password reset token for ${user.email}: ${token}`);

    return { success: true, message: 'If email exists, reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const passwordReset = await this.passwordResetRepository.findOne({
      where: { token: resetPasswordDto.token, used: false },
      relations: ['user'],
    });

    if (!passwordReset || passwordReset.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(resetPasswordDto.newPassword, 12);
    
    await this.userRepository.update(passwordReset.userId, { passwordHash });
    await this.passwordResetRepository.update(passwordReset.id, { used: true });

    return { success: true, message: 'Password reset successfully' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user || !(await bcrypt.compare(changePasswordDto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Invalid current password');
    }

    const passwordHash = await bcrypt.hash(changePasswordDto.newPassword, 12);
    await this.userRepository.update(userId, { passwordHash });

    return { success: true, message: 'Password changed successfully' };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({ 
      where: { emailVerificationToken: token } 
    });

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    await this.userRepository.update(user.id, { 
      emailVerified: true,
      emailVerificationToken: null
    });

    return { success: true, message: 'Email verified successfully' };
  }

  async resendVerificationEmail(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new ConflictException('Email already verified');
    }

    const verificationToken = Math.random().toString(36).substring(2, 15);
    await this.userRepository.update(userId, { emailVerificationToken: verificationToken });

    // In production, send email here
    console.log(`Verification token for ${user.email}: ${verificationToken}`);

    return { success: true, message: 'Verification email sent' };
  }
}