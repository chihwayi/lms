import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common';
import { LessonSubmissionsService } from './lesson-submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@Controller('lesson-submissions')
@UseGuards(JwtAuthGuard)
export class LessonSubmissionsController {
  constructor(private readonly submissionsService: LessonSubmissionsService) {}

  @Post()
  create(@Req() req: any, @Body() createSubmissionDto: CreateSubmissionDto) {
    return this.submissionsService.create(req.user as User, createSubmissionDto);
  }

  @Get()
  findAll(@Req() req: any, @Query('lessonId') lessonId?: string) {
    return this.submissionsService.findAllByStudent(req.user.id, lessonId);
  }
}
