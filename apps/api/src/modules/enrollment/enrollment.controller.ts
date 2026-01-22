import { Controller, Post, Body, UseGuards, Request, Get, Param, Patch, Query } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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

  @Patch(':courseId/progress')
  updateProgress(
    @Request() req,
    @Param('courseId') courseId: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return this.enrollmentService.updateProgress(req.user.id, courseId, updateProgressDto);
  }

  @Get(':courseId/students')
  getCourseStudents(@Param('courseId') courseId: string) {
    return this.enrollmentService.getCourseStudents(courseId);
  }

  @Get(':courseId/search-students')
  searchPotentialStudents(
    @Param('courseId') courseId: string,
    @Query('q') query: string,
  ) {
    return this.enrollmentService.findPotentialStudents(courseId, query);
  }

  @Post(':courseId/students')
  enrollStudentByEmail(
    @Param('courseId') courseId: string,
    @Body('email') email: string,
  ) {
    return this.enrollmentService.enrollByEmail(courseId, email);
  }

  @Post(':courseId/bulk')
  enrollBulk(
    @Param('courseId') courseId: string,
    @Body('userIds') userIds: string[],
  ) {
    return this.enrollmentService.enrollMany(courseId, userIds);
  }
}
