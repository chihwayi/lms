'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  courseId: string;
  lessonId?: string;
  onUploadComplete?: (file: any) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
}

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  result?: any;
}

export function FileUpload({ 
  courseId, 
  lessonId, 
  onUploadComplete,
  acceptedTypes = ['.mp4', '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.png'],
  maxSize = 2 * 1024 * 1024 * 1024 // 2GB
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadFile[] = Array.from(selectedFiles).map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    // Validate files
    const validFiles = newFiles.filter(({ file }) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is ${formatFileSize(maxSize)}`);
        return false;
      }

      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.includes(extension)) {
        toast.error(`${file.name} is not a supported file type`);
        return false;
      }

      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    const formData = new FormData();
    formData.append('file', uploadFile.file);
    formData.append('courseId', courseId);
    if (lessonId) {
      formData.append('lessonId', lessonId);
    }

    try {
      setFiles(prev => prev.map(f => 
        f === uploadFile ? { ...f, status: 'uploading' } : f
      ));

      const token = localStorage.getItem('token');
      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setFiles(prev => prev.map(f => 
              f === uploadFile ? { ...f, progress } : f
            ));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200 || xhr.status === 201) {
            const result = JSON.parse(xhr.responseText);
            setFiles(prev => prev.map(f => 
              f === uploadFile ? { ...f, status: 'completed', result } : f
            ));
            onUploadComplete?.(result);
            toast.success(`${uploadFile.file.name} uploaded successfully`);
            resolve(result);
          } else {
            const error = 'Upload failed';
            setFiles(prev => prev.map(f => 
              f === uploadFile ? { ...f, status: 'error', error } : f
            ));
            toast.error(`Failed to upload ${uploadFile.file.name}`);
            reject(new Error(error));
          }
        });

        xhr.addEventListener('error', () => {
          const error = 'Network error';
          setFiles(prev => prev.map(f => 
            f === uploadFile ? { ...f, status: 'error', error } : f
          ));
          toast.error(`Failed to upload ${uploadFile.file.name}`);
          reject(new Error(error));
        });

        xhr.open('POST', '/api/v1/files/upload');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f === uploadFile ? { ...f, status: 'error', error: 'Upload failed' } : f
      ));
      toast.error(`Failed to upload ${uploadFile.file.name}`);
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const file of pendingFiles) {
      await uploadFile(file);
    }
  };

  const removeFile = (fileToRemove: UploadFile) => {
    setFiles(prev => prev.filter(f => f !== fileToRemove));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    // You can add more specific icons based on file type
    return <File className="w-8 h-8 text-blue-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileSelect(e.dataTransfer.files);
        }}
      >
        <CardContent className="p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload Course Files
          </h3>
          <p className="text-gray-500 mb-4">
            Drag and drop files here, or click to select files
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <p className="text-xs text-gray-400 mt-2">
            Supported: {acceptedTypes.join(', ')} • Max size: {formatFileSize(maxSize)}
          </p>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Files ({files.length})</h4>
            <Button
              onClick={uploadAllFiles}
              disabled={!files.some(f => f.status === 'pending')}
              size="sm"
            >
              Upload All
            </Button>
          </div>

          {files.map((uploadFile, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  {getFileIcon(uploadFile.file.name)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                    
                    {uploadFile.status === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={uploadFile.progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round(uploadFile.progress)}% uploaded
                        </p>
                      </div>
                    )}
                    
                    {uploadFile.status === 'error' && (
                      <p className="text-xs text-red-500 mt-1">
                        {uploadFile.error}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusIcon(uploadFile.status)}
                    
                    {uploadFile.status === 'pending' && (
                      <Button
                        onClick={() => uploadFile(uploadFile)}
                        size="sm"
                        variant="outline"
                      >
                        Upload
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => removeFile(uploadFile)}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}