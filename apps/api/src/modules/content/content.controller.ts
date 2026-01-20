import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('upload/initiate')
  initiateUpload(@Body() body: { fileName: string; fileSize: number; courseId: string }, @Request() req) {
    return this.contentService.initiateUpload(body.fileName, body.fileSize, body.courseId, req.user.id);
  }

  @Post('upload/chunk')
  uploadChunk(@Body() body: { uploadId: string; chunkIndex: number; chunkData: string }, @Request() req) {
    return this.contentService.uploadChunk(body.uploadId, body.chunkIndex, body.chunkData, req.user.id);
  }

  @Post('upload/complete')
  completeUpload(@Body() body: { uploadId: string }, @Request() req) {
    return this.contentService.completeUpload(body.uploadId, req.user.id);
  }

  @Get(':id/status')
  getContentStatus(@Param('id') id: string) {
    return this.contentService.getContentStatus(id);
  }

  @Get(':id/versions')
  getContentVersions(@Param('id') id: string) {
    return this.contentService.getContentVersions(id);
  }

  @Post(':id/progress')
  updateProgress(@Param('id') id: string, @Body() body: { currentTime: number; duration: number }, @Request() req) {
    return this.contentService.updateProgress(id, body.currentTime, body.duration, req.user.id);
  }

  @Get(':id/bookmarks')
  getBookmarks(@Param('id') id: string, @Request() req) {
    return this.contentService.getBookmarks(id, req.user.id);
  }

  @Post(':id/bookmarks')
  createBookmark(@Param('id') id: string, @Body() body: { time: number; note?: string }, @Request() req) {
    return this.contentService.createBookmark(id, body.time, body.note, req.user.id);
  }
}