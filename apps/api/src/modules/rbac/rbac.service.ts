import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async assignRoleToUser(userId: string, roleName: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
    });

    if (user && role) {
      user.roles = user.roles || [];
      if (!user.roles.find(r => r.id === role.id)) {
        user.roles.push(role);
        await this.userRepository.save(user);
      }
    }
  }

  async removeRoleFromUser(userId: string, roleName: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (user && user.roles) {
      user.roles = user.roles.filter(role => role.name !== roleName);
      await this.userRepository.save(user);
    }
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) return [];

    const permissions = user.roles.flatMap(role => 
      role.permissions?.map(p => p.name) || []
    );

    return [...new Set(permissions)];
  }

  async getAllRoles() {
    return this.roleRepository.find({
      relations: ['permissions'],
    });
  }

  async getAllPermissions() {
    return this.permissionRepository.find();
  }
}