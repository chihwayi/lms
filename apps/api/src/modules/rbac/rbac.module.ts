import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { User } from '../users/entities/user.entity';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { RbacSeeder } from './rbac.seeder';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, User])],
  controllers: [RbacController],
  providers: [RbacService, RbacSeeder, RolesGuard],
  exports: [RbacService, RolesGuard],
})
export class RbacModule {}