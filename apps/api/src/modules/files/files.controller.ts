import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Body,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';

@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @RequirePermissions('create_courses')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('courseId') courseId: string,
    @Body('lessonId') lessonId: string,
    @Request() req,
  ) {
    return this.filesService.uploadFile(
      file,
      courseId,
      lessonId || null,
      req.user.id,
    );
  }

  @Post('student/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadStudentSubmission(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.filesService.uploadStudentSubmission(
      file,
      req.user.id,
    );
  }

  @Delete(':id')
  @RequirePermissions('manage_courses')
  async deleteFile(@Param('id') id: string, @Request() req) {
    return this.filesService.deleteFile(id, req.user.id);
  }

  @Get(':id/stream')
  async streamFile(
    @Param('id') id: string, 
    @Res() res: Response,
    @Request() req,
  ) {
    const range = req.headers.range;
    return this.filesService.streamFile(id, res, range);
  }

  @Get(':id/download')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    return this.filesService.downloadFile(id, res);
  }

  @Get('course/:courseId')
  async getCourseFiles(@Param('courseId') courseId: string) {
    return this.filesService.getCourseFiles(courseId);
  }
}