import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get(':lessonId/note')
  getLessonNote(@Param('lessonId') lessonId: string, @Request() req) {
    return this.coursesService.getLessonNote(lessonId, req.user.id);
  }

  @Put(':lessonId/note')
  saveLessonNote(@Param('lessonId') lessonId: string, @Body('content') content: string, @Request() req) {
    return this.coursesService.saveLessonNote(lessonId, req.user.id, content);
  }
}
