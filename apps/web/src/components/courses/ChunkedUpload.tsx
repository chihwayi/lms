'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface ChunkedUploadProps {
  courseId: string;
  onUploadComplete?: (fileId: string) => void;
}

export function ChunkedUpload({ courseId, onUploadComplete }: ChunkedUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setProgress(0);
      setStatus('');
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    setUploading(true);
    setStatus('Initiating upload...');

    try {
      // Step 1: Initiate upload
      const initiateResponse = await apiClient('/api/v1/content/upload/initiate', {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          courseId,
        }),
      });

      if (!initiateResponse.ok) {
        throw new Error('Failed to initiate upload');
      }

      const { uploadId, chunkSize, totalChunks } = await initiateResponse.json();
      setStatus(`Uploading ${totalChunks} chunks...`);

      // Step 2: Upload chunks
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        
        const reader = new FileReader();
        const chunkData = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(chunk);
        });

        const chunkResponse = await apiClient('/api/v1/content/upload/chunk', {
          method: 'POST',
          body: JSON.stringify({
            uploadId,
            chunkIndex: i,
            chunkData: chunkData.split(',')[1], // Remove data URL prefix
          }),
        });

        if (!chunkResponse.ok) {
          throw new Error(`Failed to upload chunk ${i + 1}`);
        }

        const chunkResult = await chunkResponse.json();
        setProgress(chunkResult.progress);
      }

      // Step 3: Complete upload
      setStatus('Completing upload...');
      const completeResponse = await apiClient('/api/v1/content/upload/complete', {
        method: 'POST',
        body: JSON.stringify({ uploadId }),
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to complete upload');
      }

      const result = await completeResponse.json();
      setStatus('Upload completed successfully!');
      toast.success('File uploaded successfully!');
      onUploadComplete?.(result.fileId);

    } catch (error) {
      toast.error('Upload failed');
      setStatus('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          id="chunked-file-input"
          accept="video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
        />
        <label htmlFor="chunked-file-input" className="cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">
            {file ? file.name : 'Select large file for chunked upload'}
          </p>
          <p className="text-sm text-gray-500">
            Supports files up to 2GB with resume capability
          </p>
        </label>
      </div>

      {file && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
            <Button
              onClick={uploadFile}
              disabled={uploading}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {progress === 100 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-blue-500" />
                )}
                <span>{status}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}