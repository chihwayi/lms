'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LessonContentRenderer, ContentBlock } from './LessonContentRenderer';

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
  if (!isOpen || !content) return null;

  const blocks = content.data?.blocks as ContentBlock[] | undefined;
  
  // Determine legacy types if no blocks
  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0;
  const isVideo = !hasBlocks && (content.fileType.startsWith('video/') || content.fileType === 'video');
  const isQuiz = !hasBlocks && content.fileType === 'quiz';
  // const isText = !hasBlocks && content.fileType === 'text'; // Handled by renderer fallback

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">{content.title || 'Preview'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <LessonContentRenderer 
            lessonId={content.id}
            blocks={blocks}
            content={content.data?.html || content.data?.content} // Legacy text content
            contentType={content.fileType}
            contentData={content.data}
          />
        </div>
      </div>
    </div>
  );
}
