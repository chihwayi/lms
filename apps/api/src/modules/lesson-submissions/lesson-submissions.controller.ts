import { Controller, Post, Body, UseGuards, Req, Get, Query, Param } from '@nestjs/common';
import { LessonSubmissionsService } from './lesson-submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';

@Controller('lesson-submissions')
@UseGuards(JwtAuthGuard)
export class LessonSubmissionsController {
  constructor(private readonly submissionsService: LessonSubmissionsService) {}

  @Post()
  create(@Req() req: any, @Body() createSubmissionDto: CreateSubmissionDto) {
    return this.submissionsService.create(req.user as User, createSubmissionDto);
  }

  @Get('my-submissions')
  findAllMy(@Req() req: any, @Query('lessonId') lessonId?: string) {
    return this.submissionsService.findAllByStudent(req.user.id, lessonId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @RequirePermissions('view_analytics') // Assuming instructors have this
  findAll(
    @Query('lessonId') lessonId?: string,
    @Query('studentId') studentId?: string,
    @Query('courseId') courseId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.submissionsService.findAll({ lessonId, studentId, courseId, limit });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // TODO: Add ownership/role check here if strict security needed
    return this.submissionsService.findOne(id);
  }
}
