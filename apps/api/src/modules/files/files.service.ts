import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseFile } from '../courses/entities/course-file.entity';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createReadStream, existsSync } from 'fs';

@Injectable()
export class FilesService {
  private readonly uploadPath = './uploads';
  private readonly maxFileSize = 2 * 1024 * 1024 * 1024; // 2GB
  
  private readonly allowedTypes = {
    video: ['.mp4', '.webm', '.mov', '.avi'],
    document: ['.pdf', '.doc', '.docx', '.ppt', '.pptx'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    audio: ['.mp3', '.wav', '.ogg'],
  };

  constructor(
    @InjectRepository(CourseFile)
    private fileRepository: Repository<CourseFile>,
  ) {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    courseId: string,
    lessonId: string | null,
    userId: string,
  ): Promise<CourseFile> {
    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size exceeds 2GB limit');
    }

    // Validate file type
    const ext = path.extname(file.originalname).toLowerCase();
    const fileType = this.getFileType(ext);
    
    if (!fileType) {
      throw new BadRequestException('Unsupported file type');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.originalname}`;
    const filePath = path.join(this.uploadPath, fileName);

    // Save file to disk
    await fs.writeFile(filePath, file.buffer);

    // Save file record to database
    const courseFile = this.fileRepository.create({
      course_id: courseId,
      lesson_id: lessonId,
      original_name: file.originalname,
      file_name: fileName,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.mimetype,
      file_type: fileType,
      processing_status: 'completed',
      uploaded_by: userId,
    });

    return this.fileRepository.save(courseFile);
  }

  private getFileType(ext: string): string | null {
    for (const [type, extensions] of Object.entries(this.allowedTypes)) {
      if (extensions.includes(ext)) {
        return type;
      }
    }
    return null;
  }

  async getFile(id: string): Promise<CourseFile> {
    return this.fileRepository.findOne({
      where: { id },
      relations: ['course', 'lesson', 'uploader'],
    });
  }

  async deleteFile(id: string, userId: string): Promise<void> {
    const file = await this.getFile(id);
    
    if (!file) {
      throw new BadRequestException('File not found');
    }

    if (file.uploaded_by !== userId) {
      throw new BadRequestException('You can only delete your own files');
    }

    // Delete file from disk
    try {
      await fs.unlink(file.file_path);
    } catch (error) {
      console.error('Error deleting file from disk:', error);
    }

    // Delete record from database
    await this.fileRepository.remove(file);
  }

  async streamFile(id: string, res: Response): Promise<void> {
    const file = await this.getFile(id);
    
    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (!existsSync(file.file_path)) {
      throw new NotFoundException('File not found on disk');
    }

    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Length', file.file_size);
    res.setHeader('Content-Disposition', `inline; filename="${file.original_name}"`);
    res.setHeader('Accept-Ranges', 'bytes');
    
    const stream = createReadStream(file.file_path);
    stream.pipe(res);
  }

  async downloadFile(id: string, res: Response): Promise<void> {
    const file = await this.getFile(id);
    
    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (!existsSync(file.file_path)) {
      throw new NotFoundException('File not found on disk');
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
    res.setHeader('Content-Length', file.file_size);
    
    const stream = createReadStream(file.file_path);
    stream.pipe(res);
  }

  async getCourseFiles(courseId: string, userId: string): Promise<CourseFile[]> {
    return this.fileRepository.find({
      where: { course_id: courseId },
      relations: ['course', 'lesson', 'uploader'],
      order: { created_at: 'DESC' },
    });
  }
}