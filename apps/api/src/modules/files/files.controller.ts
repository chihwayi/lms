import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Delete(':id')
  @RequirePermissions('manage_courses')
  async deleteFile(@Param('id') id: string, @Request() req) {
    return this.filesService.deleteFile(id, req.user.id);
  }

  @Get(':id/stream')
  async streamFile(@Param('id') id: string, @Request() req) {
    return this.filesService.streamFile(id, req);
  }

  @Get('course/:courseId')
  async getCourseFiles(@Param('courseId') courseId: string, @Request() req) {
    return this.filesService.getCourseFiles(courseId, req.user.id);
  }
}