import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto, CreateModuleDto, CreateLessonDto } from './dto/course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('create_courses')
  create(@Body() createCourseDto: CreateCourseDto, @Request() req) {
    return this.coursesService.create(createCourseDto, req.user.id);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.coursesService.findAll(query);
  }

  @Get('search')
  searchCourses(@Query() query: any) {
    return this.coursesService.searchCourses(query);
  }

  @Get('categories')
  getCategories() {
    return [
      { id: '1', name: 'Programming', is_active: true },
      { id: '2', name: 'Design', is_active: true },
      { id: '3', name: 'Business', is_active: true },
      { id: '4', name: 'Marketing', is_active: true }
    ];
  }

  @Get('featured')
  getFeaturedCourses() {
    return this.coursesService.getFeaturedCourses();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('manage_courses')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto, @Request() req) {
    return this.coursesService.update(id, updateCourseDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('manage_courses')
  remove(@Param('id') id: string, @Request() req) {
    return this.coursesService.remove(id, req.user.id);
  }

  @Post(':id/publish')
  @RequirePermissions('manage_courses')
  publish(@Param('id') id: string, @Request() req) {
    return this.coursesService.publish(id, req.user.id);
  }

  @Post(':id/unpublish')
  @RequirePermissions('manage_courses')
  unpublish(@Param('id') id: string, @Request() req) {
    return this.coursesService.unpublish(id, req.user.id);
  }

  @Post(':id/modules')
  @RequirePermissions('create_courses')
  createModule(@Param('id') courseId: string, @Body() createModuleDto: CreateModuleDto, @Request() req) {
    return this.coursesService.createModule(courseId, createModuleDto, req.user.id);
  }

  @Put(':id/modules/:moduleId')
  @RequirePermissions('create_courses')
  updateModule(@Param('id') courseId: string, @Param('moduleId') moduleId: string, @Body() updateModuleDto: CreateModuleDto, @Request() req) {
    return this.coursesService.updateModule(courseId, moduleId, updateModuleDto, req.user.id);
  }

  @Delete(':id/modules/:moduleId')
  @RequirePermissions('create_courses')
  deleteModule(@Param('id') courseId: string, @Param('moduleId') moduleId: string, @Request() req) {
    return this.coursesService.deleteModule(courseId, moduleId, req.user.id);
  }

  @Put(':id/modules/reorder')
  @RequirePermissions('create_courses')
  reorderModules(@Param('id') courseId: string, @Body() body: { moduleIds: string[] }, @Request() req) {
    return this.coursesService.reorderModules(courseId, body.moduleIds, req.user.id);
  }

  @Put('modules/:moduleId/lessons/reorder')
  @RequirePermissions('create_courses')
  reorderLessons(@Param('moduleId') moduleId: string, @Body() body: { lessonIds: string[] }, @Request() req) {
    return this.coursesService.reorderLessons(moduleId, body.lessonIds, req.user.id);
  }

  @Post('modules/:moduleId/lessons')
  @RequirePermissions('create_courses')
  createLesson(@Param('moduleId') moduleId: string, @Body() createLessonDto: CreateLessonDto, @Request() req) {
    return this.coursesService.createLesson(moduleId, createLessonDto, req.user.id);
  }

  @Put('modules/:moduleId/lessons/:lessonId')
  @RequirePermissions('create_courses')
  updateLesson(@Param('moduleId') moduleId: string, @Param('lessonId') lessonId: string, @Body() updateLessonDto: CreateLessonDto, @Request() req) {
    return this.coursesService.updateLesson(moduleId, lessonId, updateLessonDto, req.user.id);
  }

  @Delete('modules/:moduleId/lessons/:lessonId')
  @RequirePermissions('create_courses')
  deleteLesson(@Param('moduleId') moduleId: string, @Param('lessonId') lessonId: string, @Request() req) {
    return this.coursesService.deleteLesson(moduleId, lessonId, req.user.id);
  }

  @Post('lessons/:lessonId/content')
  @RequirePermissions('create_courses')
  assignContentToLesson(@Param('lessonId') lessonId: string, @Body() body: { fileId: string }, @Request() req) {
    return this.coursesService.assignContentToLesson(lessonId, body.fileId, req.user.id);
  }

  @Get('lessons/:lessonId/content')
  getLessonContent(@Param('lessonId') lessonId: string) {
    return this.coursesService.getLessonContent(lessonId);
  }

  @Delete('lessons/:lessonId/content/:contentId')
  @RequirePermissions('create_courses')
  removeContentFromLesson(@Param('lessonId') lessonId: string, @Param('contentId') contentId: string, @Request() req) {
    return this.coursesService.removeContentFromLesson(lessonId, contentId, req.user.id);
  }

  @Post(':id/schedule-publish')
  @RequirePermissions('manage_courses')
  schedulePublish(@Param('id') id: string, @Body() body: { publishDate: string }, @Request() req) {
    return this.coursesService.schedulePublish(id, body.publishDate, req.user.id);
  }

  @Get(':id/publishing-status')
  getPublishingStatus(@Param('id') id: string) {
    return this.coursesService.getPublishingStatus(id);
  }



  @Get(':id/preview')
  getCoursePreview(@Param('id') id: string) {
    return this.coursesService.getCoursePreview(id);
  }
}