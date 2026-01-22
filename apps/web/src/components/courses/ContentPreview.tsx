'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from './VideoPlayer';
import { DocumentViewer } from './DocumentViewer';
import { QuizRunner, QuizData } from './QuizRunner';

interface ContentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    id: string;
    fileName?: string;
    fileType: string;
    title?: string;
    data?: any; // For quiz or text content
  } | null;
}

export function ContentPreview({ isOpen, onClose, content }: ContentPreviewProps) {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) setToken(t);
  }, []);

  if (!isOpen || !content) return null;

  const isVideo = content.fileType.startsWith('video/') || content.fileType === 'video';
  const isQuiz = content.fileType === 'quiz';
  const isText = content.fileType === 'text';
  const isDocument = !isVideo && !isQuiz && !isText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 bg-white/50">
          <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent truncate pr-4">
            {content.title || content.fileName || 'Preview'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-red-50 hover:text-red-600 rounded-full w-8 h-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1">
          {isVideo && (
            <VideoPlayer
              fileId={content.id}
              title={content.title}
            />
          )}
          
          {isDocument && content.fileName && (
            <DocumentViewer
              fileId={content.id}
              fileName={content.fileName}
              fileType={content.fileType}
              title={content.title}
            />
          )}

          {isQuiz && content.data && (
            <div className="max-w-3xl mx-auto">
              <QuizRunner 
                data={content.data as QuizData}
                onComplete={(score, passed) => {
                  console.log('Quiz preview completed', { score, passed });
                }}
              />
            </div>
          )}

          {isText && content.data?.html && (
            <div className="prose max-w-none p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div dangerouslySetInnerHTML={{ __html: content.data.html }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}