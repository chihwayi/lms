import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getDashboardStats() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { emailVerified: true }
    });
    
    const recentUsers = await this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
      select: ['id', 'email', 'firstName', 'lastName', 'createdAt']
    });

    return {
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        recentRegistrations: recentUsers.length
      },
      recentUsers
    };
  }

  async getAllUsers(page = 1, limit = 10, search?: string) {
    const query = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .select([
        'user.id',
        'user.email', 
        'user.firstName',
        'user.lastName',
        'user.emailVerified',
        'user.createdAt',
        'roles.id',
        'roles.name'
      ]);

    if (search) {
      query.where(
        'user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search',
        { search: `%${search}%` }
      );
    }

    const [users, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateUserStatus(userId: string, emailVerified: boolean) {
    await this.userRepository.update(userId, { emailVerified });
    return { success: true, message: 'User status updated' };
  }

  async deleteUser(userId: string) {
    await this.userRepository.delete(userId);
    return { success: true, message: 'User deleted successfully' };
  }
}