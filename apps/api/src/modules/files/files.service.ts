import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseFile } from '../courses/entities/course-file.entity';
import { Response } from 'express';
import * as path from 'path';
import * as Minio from 'minio';

@Injectable()
export class FilesService {
  private minioClient: Minio.Client;
  private readonly bucketName = 'eduflow-assets';
  private readonly logger = new Logger(FilesService.name);
  
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
    // Initialize MinIO Client
    this.minioClient = new Minio.Client({
      endPoint: 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: 'minioadmin',
      secretKey: 'minioadmin123',
    });

    this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        
        // Set public policy for read access (optional, but useful for public assets)
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        this.logger.log(`Bucket ${this.bucketName} created successfully`);
      }
    } catch (error) {
      this.logger.error('Error ensuring bucket exists:', error);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    courseId: string,
    lessonId: string | null,
    userId: string,
  ): Promise<CourseFile> {
    // Validate file size (2GB)
    if (file.size > 2 * 1024 * 1024 * 1024) {
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
    const fileName = `${courseId}/${timestamp}_${file.originalname.replace(/\s+/g, '_')}`;

    try {
      // Upload to MinIO
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype }
      );

      // Generate Public URL (assuming localhost:9000 is accessible)
      // In production, this would be your CDN or S3 domain
      const fileUrl = `http://localhost:9000/${this.bucketName}/${fileName}`;

      // Save file record to database
      const courseFile = this.fileRepository.create({
        course_id: courseId,
        lesson_id: lessonId,
        original_name: file.originalname,
        file_name: fileName,
        file_path: fileUrl, // Storing the full URL for simplicity in this iteration
        file_size: file.size,
        mime_type: file.mimetype,
        file_type: fileType,
        processing_status: 'completed',
        uploaded_by: userId,
      });

      return this.fileRepository.save(courseFile);
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  async uploadAvatar(file: Express.Multer.File): Promise<string> {
    const maxAvatarSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxAvatarSize) {
      throw new BadRequestException('Avatar size exceeds 5MB limit');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!this.allowedTypes.image.includes(ext)) {
      throw new BadRequestException('Only image files are allowed for avatars');
    }

    const timestamp = Date.now();
    const fileName = `avatars/${timestamp}_${file.originalname.replace(/\s+/g, '_')}`;

    try {
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype }
      );

      return fileName; // Return just the filename or path
    } catch (error) {
      this.logger.error('Error uploading avatar:', error);
      throw new BadRequestException('Failed to upload avatar');
    }
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

    // Delete file from MinIO
    try {
      await this.minioClient.removeObject(this.bucketName, file.file_name);
    } catch (error) {
      this.logger.error('Error deleting file from MinIO:', error);
      // We continue to delete from DB even if MinIO fails (orphaned file is better than broken DB state)
    }

    // Delete record from database
    await this.fileRepository.remove(file);
  }

  async streamFile(id: string, res: Response): Promise<void> {
    const file = await this.getFile(id);
    
    if (!file) {
      throw new NotFoundException('File not found');
    }

    try {
      // Check if object exists
      await this.minioClient.statObject(this.bucketName, file.file_name);

      res.setHeader('Content-Type', file.mime_type);
      res.setHeader('Content-Length', file.file_size);
      res.setHeader('Content-Disposition', `inline; filename="${file.original_name}"`);
      res.setHeader('Accept-Ranges', 'bytes');
      
      const stream = await this.minioClient.getObject(this.bucketName, file.file_name);
      stream.pipe(res);
    } catch (error) {
      this.logger.error('Error streaming file:', error);
      throw new NotFoundException('File not found in storage');
    }
  }

  async downloadFile(id: string, res: Response): Promise<void> {
    const file = await this.getFile(id);
    
    if (!file) {
      throw new NotFoundException('File not found');
    }

    try {
       // Check if object exists
      await this.minioClient.statObject(this.bucketName, file.file_name);

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
      res.setHeader('Content-Length', file.file_size);
      
      const stream = await this.minioClient.getObject(this.bucketName, file.file_name);
      stream.pipe(res);
    } catch (error) {
      this.logger.error('Error downloading file:', error);
      throw new NotFoundException('File not found in storage');
    }
  }

  async getCourseFiles(courseId: string): Promise<CourseFile[]> {
    return this.fileRepository.find({
      where: { course_id: courseId },
      relations: ['course', 'lesson', 'uploader'],
      order: { created_at: 'DESC' },
    });
  }
}