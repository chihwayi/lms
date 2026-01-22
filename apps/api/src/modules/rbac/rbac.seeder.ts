import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@Injectable()
export class RbacSeeder implements OnModuleInit {
  private readonly logger = new Logger(RbacSeeder.name);

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async onModuleInit() {
    await this.seedPermissions();
    await this.seedRoles();
    await this.assignPermissionsToRoles();
  }

  private async seedPermissions() {
    const permissions = [
      { name: 'create_courses', description: 'Can create new courses', resource: 'courses', action: 'create' },
      { name: 'manage_courses', description: 'Can update/delete courses', resource: 'courses', action: 'manage' },
      { name: 'view_users', description: 'Can view user list', resource: 'users', action: 'read' },
      { name: 'manage_users', description: 'Can manage users and roles', resource: 'users', action: 'manage' },
    ];

    for (const perm of permissions) {
      const existing = await this.permissionRepository.findOne({ where: { name: perm.name } });
      if (!existing) {
        this.logger.log(`Seeding permission: ${perm.name}`);
        await this.permissionRepository.save(perm);
      }
    }
  }

  private async seedRoles() {
    const roles = [
      { name: 'admin', description: 'Administrator with full access', level: 100 },
      { name: 'instructor', description: 'Instructor', level: 50 },
      { name: 'learner', description: 'Learner/Student', level: 1 },
    ];

    for (const role of roles) {
      const existing = await this.roleRepository.findOne({ where: { name: role.name } });
      if (!existing) {
        this.logger.log(`Seeding role: ${role.name}`);
        await this.roleRepository.save(role);
      }
    }
  }

  private async assignPermissionsToRoles() {
    const adminRole = await this.roleRepository.findOne({ 
      where: { name: 'admin' },
      relations: ['permissions'] 
    });
    
    const instructorRole = await this.roleRepository.findOne({ 
      where: { name: 'instructor' },
      relations: ['permissions'] 
    });

    const allPermissions = await this.permissionRepository.find();

    if (adminRole) {
      // Admin gets all permissions
      const missingPerms = allPermissions.filter(p => 
        !adminRole.permissions.find(rp => rp.id === p.id)
      );
      
      if (missingPerms.length > 0) {
        this.logger.log(`Assigning ${missingPerms.length} new permissions to Admin role`);
        adminRole.permissions = [...adminRole.permissions, ...missingPerms];
        await this.roleRepository.save(adminRole);
      }
    }

    if (instructorRole) {
      // Instructor gets course permissions
      const coursePerms = allPermissions.filter(p => 
        ['create_courses', 'manage_courses'].includes(p.name)
      );
      
      const missingPerms = coursePerms.filter(p => 
        !instructorRole.permissions.find(rp => rp.id === p.id)
      );

      if (missingPerms.length > 0) {
        this.logger.log(`Assigning ${missingPerms.length} new permissions to Instructor role`);
        instructorRole.permissions = [...instructorRole.permissions, ...missingPerms];
        await this.roleRepository.save(instructorRole);
      }
    }
  }
}
