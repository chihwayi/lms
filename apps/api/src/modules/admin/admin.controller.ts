import { Controller, Get, Put, Query, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @RequirePermissions('manage_users')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @RequirePermissions('view_users')
  async getUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string
  ) {
    return this.adminService.getAllUsers(+page, +limit, search);
  }

  @Put('users/:userId/status')
  @RequirePermissions('manage_users')
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body('emailVerified') emailVerified: boolean
  ) {
    return this.adminService.updateUserStatus(userId, emailVerified);
  }
}