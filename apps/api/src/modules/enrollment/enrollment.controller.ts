import { Controller, Post, Body, UseGuards, Request, Get, Param, Patch, Query } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  create(@Request() req, @Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentService.enroll(req.user.id, createEnrollmentDto);
  }

  @Get('my-courses')
  getMyCourses(@Request() req) {
    return this.enrollmentService.getMyCourses(req.user.id);
  }

  @Get('last-accessed')
  getLastAccessed(@Request() req) {
    return this.enrollmentService.getLastAccessed(req.user.id);
  }

  @Get(':courseId/check')
  checkEnrollment(@Request() req, @Param('courseId') courseId: string) {
    return this.enrollmentService.checkEnrollment(req.user.id, courseId);
  }

  @Patch('progress')
  updateProgress(
    @Request() req,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    console.log('PATCH /enrollments/progress hit', req.user.id, updateProgressDto);
    return this.enrollmentService.updateProgress(req.user.id, updateProgressDto);
  }

  @Post(':enrollmentId/quiz/:lessonId')
  submitQuiz(
    @Request() req,
    @Param('enrollmentId') enrollmentId: string,
    @Param('lessonId') lessonId: string,
    @Body() answers: Record<string, string>,
  ) {
    return this.enrollmentService.submitQuiz(req.user.id, enrollmentId, lessonId, answers);
  }

  @Get(':courseId/students')
  @UseGuards(RolesGuard)
  @RequirePermissions('manage_courses')
  getCourseStudents(@Param('courseId') courseId: string) {
    return this.enrollmentService.getCourseStudents(courseId);
  }

  @Get(':courseId/search-students')
  @UseGuards(RolesGuard)
  @RequirePermissions('manage_courses')
  searchPotentialStudents(
    @Param('courseId') courseId: string,
    @Query('q') query: string,
  ) {
    return this.enrollmentService.findPotentialStudents(courseId, query);
  }

  @Post(':courseId/students')
  @UseGuards(RolesGuard)
  @RequirePermissions('manage_courses')
  enrollStudentByEmail(
    @Param('courseId') courseId: string,
    @Body('email') email: string,
  ) {
    return this.enrollmentService.enrollByEmail(courseId, email);
  }

  @Post(':courseId/bulk')
  @UseGuards(RolesGuard)
  @RequirePermissions('manage_courses')
  enrollBulk(
    @Param('courseId') courseId: string,
    @Body('userIds') userIds: string[],
  ) {
    return this.enrollmentService.enrollMany(courseId, userIds);
  }
}
