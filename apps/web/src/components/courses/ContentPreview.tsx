'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from './VideoPlayer';
import { DocumentViewer } from './DocumentViewer';

interface ContentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    id: string;
    fileName: string;
    fileType: string;
    title?: string;
  } | null;
}

export function ContentPreview({ isOpen, onClose, content }: ContentPreviewProps) {
  if (!isOpen || !content) return null;

  const isVideo = content.fileType.startsWith('video/');
  const isDocument = content.fileType === 'application/pdf' || 
                    content.fileType.startsWith('application/') || 
                    content.fileType.startsWith('text/') ||
                    content.fileType.startsWith('image/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white/95 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {content.title || content.fileName}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {isVideo && (
            <VideoPlayer
              fileId={content.id}
              title={content.title}
            />
          )}
          
          {isDocument && (
            <DocumentViewer
              fileId={content.id}
              fileName={content.fileName}
              fileType={content.fileType}
              title={content.title}
            />
          )}
          
          {!isVideo && !isDocument && (
            <div className="text-center py-12">
              <p className="text-gray-600">Preview not available for this file type.</p>
              <Button 
                className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `/api/files/${content.id}/download`;
                  link.download = content.fileName;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                Download File
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}