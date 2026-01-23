import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsSeeder } from './analytics.seeder';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly analyticsSeeder: AnalyticsSeeder,
  ) {}

  @Post('seed')
  async seedData() {
    await this.analyticsSeeder.seed();
    return { message: 'Analytics data seeded' };
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async getDashboardStats() {
    return await this.analyticsService.getDashboardStats();
  }

  @Get('at-risk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async getAtRiskStudents() {
    return await this.analyticsService.getAtRiskStudents();
  }

  @Get('course-insights')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async getCourseInsights() {
    return await this.analyticsService.getCourseInsights();
  }

  @Get('quiz-analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async getQuizAnalytics() {
    return await this.analyticsService.getQuizAnalytics();
  }
}
