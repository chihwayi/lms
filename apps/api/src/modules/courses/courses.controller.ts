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
import { CoursesService, CourseQuery, SearchCoursesQuery } from './courses.service';
import { CreateCourseDto, UpdateCourseDto, CreateModuleDto, CreateLessonDto, UpdateLessonDto } from './dto/course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';
import { KidsAccessGuard } from '../kids-settings/guards/kids-access.guard';

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

  @Post('seed-math')
  @UseGuards(JwtAuthGuard, RolesGuard)
  seedMath(@Request() req) {
    return this.coursesService.seedMathCourse(req.user.id);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Query() query: CourseQuery, @Request() req) {
    return this.coursesService.findAll(query, req.user);
  }

  @Get('search')
  @UseGuards(OptionalJwtAuthGuard)
  searchCourses(@Query() query: SearchCoursesQuery, @Request() req) {
    return this.coursesService.searchCourses(query, req.user);
  }

  @Get('categories')
  getCategories() {
    return this.coursesService.getCategories();
  }

  @Get('featured')
  getFeaturedCourses() {
    return this.coursesService.getFeaturedCourses();
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard, KidsAccessGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.coursesService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('manage_courses')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto, @Request() req) {
    return this.coursesService.update(id, updateCourseDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('manage_courses')
  remove(@Param('id') id: string, @Request() req) {
    return this.coursesService.remove(id, req.user.id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('manage_courses')
  publish(@Param('id') id: string, @Request() req) {
    return this.coursesService.publish(id, req.user.id);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('manage_courses')
  unpublish(@Param('id') id: string, @Request() req) {
    return this.coursesService.unpublish(id, req.user.id);
  }

  @Post(':id/modules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('create_courses')
  createModule(@Param('id') courseId: string, @Body() createModuleDto: CreateModuleDto, @Request() req) {
    return this.coursesService.createModule(courseId, createModuleDto, req.user.id);
  }

  @Put(':id/modules/:moduleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('create_courses')
  updateModule(@Param('id') courseId: string, @Param('moduleId') moduleId: string, @Body() updateModuleDto: CreateModuleDto, @Request() req) {
    return this.coursesService.updateModule(courseId, moduleId, updateModuleDto, req.user.id);
  }

  @Delete(':id/modules/:moduleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('create_courses')
  deleteModule(@Param('id') courseId: string, @Param('moduleId') moduleId: string, @Request() req) {
    return this.coursesService.deleteModule(courseId, moduleId, req.user.id);
  }

  @Put(':id/modules/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('create_courses')
  reorderModules(@Param('id') courseId: string, @Body() body: { moduleIds: string[] }, @Request() req) {
    return this.coursesService.reorderModules(courseId, body.moduleIds, req.user.id);
  }

  @Put('modules/:moduleId/lessons/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('create_courses')
  reorderLessons(@Param('moduleId') moduleId: string, @Body() body: { lessonIds: string[] }, @Request() req) {
    return this.coursesService.reorderLessons(moduleId, body.lessonIds, req.user.id);
  }

  @Post('modules/:moduleId/lessons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('create_courses')
  createLesson(@Param('moduleId') moduleId: string, @Body() createLessonDto: CreateLessonDto, @Request() req) {
    return this.coursesService.createLesson(moduleId, createLessonDto, req.user.id);
  }

  @Put('modules/:moduleId/lessons/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('create_courses')
  updateLesson(@Param('moduleId') moduleId: string, @Param('lessonId') lessonId: string, @Body() updateLessonDto: UpdateLessonDto, @Request() req) {
    return this.coursesService.updateLesson(moduleId, lessonId, updateLessonDto, req.user.id);
  }

  @Patch('lessons/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('create_courses')
  updateLessonDirectly(@Param('lessonId') lessonId: string, @Body() updateLessonDto: UpdateLessonDto, @Request() req) {
    return this.coursesService.updateLessonDirectly(lessonId, updateLessonDto, req.user.id);
  }

  @Delete('modules/:moduleId/lessons/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('create_courses')
  deleteLesson(@Param('moduleId') moduleId: string, @Param('lessonId') lessonId: string, @Request() req) {
    return this.coursesService.deleteLesson(moduleId, lessonId, req.user.id);
  }

  @Post('lessons/:lessonId/content')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('create_courses')
  assignContentToLesson(@Param('lessonId') lessonId: string, @Body() body: { fileId: string }, @Request() req) {
    return this.coursesService.assignContentToLesson(lessonId, body.fileId, req.user.id);
  }

  @Get('lessons/:lessonId/content')
  getLessonContent(@Param('lessonId') lessonId: string) {
    return this.coursesService.getLessonContent(lessonId);
  }

  @Delete('lessons/:lessonId/content/:contentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('create_courses')
  removeContentFromLesson(@Param('lessonId') lessonId: string, @Param('contentId') contentId: string, @Request() req) {
    return this.coursesService.removeContentFromLesson(lessonId, contentId, req.user.id);
  }

  @Post(':id/schedule-publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('manage_courses')
  schedulePublish(@Param('id') id: string, @Body() body: { publishDate: string }, @Request() req) {
    return this.coursesService.schedulePublish(id, body.publishDate, req.user.id);
  }

  @Get(':id/publishing-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getPublishingStatus(@Param('id') id: string, @Request() req) {
    return this.coursesService.getPublishingStatus(id, req.user);
  }



  @Get(':id/preview')
  getCoursePreview(@Param('id') id: string) {
    return this.coursesService.getCoursePreview(id);
  }

  @Get(':courseId/lessons/:lessonId')
  getLesson(@Param('courseId') courseId: string, @Param('lessonId') lessonId: string) {
    return this.coursesService.getLessonContent(lessonId);
  }
}