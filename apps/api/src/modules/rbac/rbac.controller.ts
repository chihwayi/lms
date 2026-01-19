import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RequirePermissions } from './decorators/permissions.decorator';
import { RbacService } from './rbac.service';

@Controller('rbac')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  @RequirePermissions('manage_users')
  async getAllRoles() {
    return this.rbacService.getAllRoles();
  }

  @Get('permissions')
  @RequirePermissions('manage_users')
  async getAllPermissions() {
    return this.rbacService.getAllPermissions();
  }

  @Post('users/:userId/roles')
  @RequirePermissions('manage_users')
  async assignRole(@Param('userId') userId: string, @Body('roleName') roleName: string) {
    await this.rbacService.assignRoleToUser(userId, roleName);
    return { success: true, message: 'Role assigned successfully' };
  }

  @Get('users/:userId/permissions')
  @RequirePermissions('view_users')
  async getUserPermissions(@Param('userId') userId: string) {
    const permissions = await this.rbacService.getUserPermissions(userId);
    return { permissions };
  }
}