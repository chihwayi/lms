import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ContentService {
  private uploads = new Map();
  private progress = new Map();
  private bookmarks = new Map();

  async initiateUpload(fileName: string, fileSize: number, courseId: string, userId: string) {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(fileSize / chunkSize);
    
    this.uploads.set(uploadId, {
      id: uploadId,
      fileName,
      fileSize,
      courseId,
      userId,
      totalChunks,
      uploadedChunks: 0,
      chunks: new Map(),
      status: 'initiated',
      createdAt: new Date(),
    });

    return {
      uploadId,
      chunkSize,
      totalChunks,
      status: 'initiated',
    };
  }

  async uploadChunk(uploadId: string, chunkIndex: number, chunkData: string, userId: string) {
    const upload = this.uploads.get(uploadId);
    if (!upload || upload.userId !== userId) {
      throw new NotFoundException('Upload not found');
    }

    upload.chunks.set(chunkIndex, chunkData);
    upload.uploadedChunks = upload.chunks.size;
    upload.status = upload.uploadedChunks === upload.totalChunks ? 'ready' : 'uploading';

    return {
      uploadId,
      chunkIndex,
      uploadedChunks: upload.uploadedChunks,
      totalChunks: upload.totalChunks,
      progress: (upload.uploadedChunks / upload.totalChunks) * 100,
      status: upload.status,
    };
  }

  async completeUpload(uploadId: string, userId: string) {
    const upload = this.uploads.get(uploadId);
    if (!upload || upload.userId !== userId) {
      throw new NotFoundException('Upload not found');
    }

    if (upload.status !== 'ready') {
      throw new Error('Upload not ready for completion');
    }

    // Simulate file processing
    upload.status = 'processing';
    
    setTimeout(() => {
      upload.status = 'completed';
      upload.fileId = `file_${Date.now()}`;
    }, 2000);

    return {
      uploadId,
      status: 'processing',
      message: 'File processing started',
    };
  }

  async getContentStatus(id: string) {
    const upload = this.uploads.get(id);
    if (!upload) {
      return {
        id,
        status: 'not_found',
        processingSteps: [],
      };
    }

    const steps = [
      { name: 'upload', status: 'completed', progress: 100 },
      { name: 'validation', status: upload.status === 'completed' ? 'completed' : 'processing', progress: upload.status === 'completed' ? 100 : 50 },
      { name: 'processing', status: upload.status === 'completed' ? 'completed' : 'pending', progress: upload.status === 'completed' ? 100 : 0 },
    ];

    return {
      id,
      status: upload.status,
      processingSteps: steps,
      fileId: upload.fileId,
    };
  }

  async getContentVersions(id: string) {
    return {
      contentId: id,
      versions: [
        {
          id: `${id}_v1`,
          version: '1.0.0',
          createdAt: new Date(),
          size: 1024000,
          status: 'active',
        },
      ],
    };
  }

  async updateProgress(contentId: string, currentTime: number, duration: number, userId: string) {
    const key = `${userId}_${contentId}`;
    const progressData = {
      contentId,
      userId,
      currentTime,
      duration,
      percentComplete: (currentTime / duration) * 100,
      lastUpdated: new Date(),
    };

    this.progress.set(key, progressData);
    return progressData;
  }

  async getBookmarks(contentId: string, userId: string) {
    const key = `${userId}_${contentId}`;
    return this.bookmarks.get(key) || [];
  }

  async createBookmark(contentId: string, time: number, note: string, userId: string) {
    const key = `${userId}_${contentId}`;
    const bookmarks = this.bookmarks.get(key) || [];
    
    const bookmark = {
      id: `bookmark_${Date.now()}`,
      contentId,
      userId,
      time,
      note,
      createdAt: new Date(),
    };

    bookmarks.push(bookmark);
    this.bookmarks.set(key, bookmarks);
    
    return bookmark;
  }
}