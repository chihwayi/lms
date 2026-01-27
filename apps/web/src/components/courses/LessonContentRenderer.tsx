
import React from 'react';
import { VideoPlayer } from './VideoPlayer';
import { DocumentViewer } from './DocumentViewer';
import { AudioPlayer } from './AudioPlayer';
import { DrawingCanvas } from '@/components/kids/DrawingCanvas';
import { VoiceRecorder } from '@/components/kids/VoiceRecorder';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useAuthStore } from '@/lib/auth-store';
import { useConfigStore } from '@/lib/config-store';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export interface ContentBlock {
  id: string;
  type: 'text' | 'video' | 'audio' | 'document' | 'image' | 'quiz' | 'drawing' | 'voice';
  content?: string; // For text
  fileId?: string; // For media
  fileName?: string;
  mimeType?: string;
  title?: string;
  data?: any;
  order: number;
}

interface LessonContentRendererProps {
  lessonId?: string;
  blocks?: ContentBlock[];
  // Legacy support
  content?: string;
  contentType?: string;
  contentData?: any;
  videoStartAtSeconds?: number;
  onVideoProgress?: (currentTime: number, duration: number) => void;
}

export function LessonContentRenderer({ lessonId, blocks, content, contentType, contentData, videoStartAtSeconds, onVideoProgress }: LessonContentRendererProps) {
  const { accessToken: token } = useAuthStore();
  const { instanceUrl } = useConfigStore();
  const baseUrl = instanceUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const processContent = (html: string) => {
    if (!html) return '';
    return html.replace(/\$([^$]+)\$/g, (match, equation) => {
      return `<span data-type="mathematics" data-content="${equation.replace(/"/g, '&quot;')}"></span>`;
    });
  };

  const handleDrawingSave = async (dataUrl: string, blockId: string) => {
    try {
      // Convert base64 to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, `drawing-${blockId}.png`);
      
      // Upload
      const uploadRes = await apiClient('files/student/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadRes.ok) throw new Error('Upload failed');
      
      const data = await uploadRes.json();
      console.log('Uploaded drawing:', data.url);
      
      // Save the submission record
      if (lessonId) {
        await apiClient('lesson-submissions', {
          method: 'POST',
          body: JSON.stringify({
            lessonId,
            contentBlockId: blockId,
            submissionType: 'drawing',
            submissionUrl: data.url
          }),
        });
        toast.success('Drawing saved and submitted!');
      } else {
        toast.success('Drawing saved (preview mode)!');
      }
    } catch (error) {
      console.error('Failed to save drawing:', error);
      toast.error('Failed to save drawing. Please try again.');
    }
  };

  const handleVoiceSave = async (blob: Blob, blockId: string) => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, `voice-${blockId}.webm`);
      
      // Upload
      const uploadRes = await apiClient('files/student/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadRes.ok) throw new Error('Upload failed');
      
      const data = await uploadRes.json();
      console.log('Uploaded voice:', data.url);
      
      // Save the submission record
      if (lessonId) {
        await apiClient('lesson-submissions', {
          method: 'POST',
          body: JSON.stringify({
            lessonId,
            contentBlockId: blockId,
            submissionType: 'voice',
            submissionUrl: data.url
          }),
        });
        toast.success('Voice recording saved and submitted!');
      } else {
        toast.success('Voice recording saved (preview mode)!');
      }
    } catch (error) {
      console.error('Failed to save voice recording:', error);
      toast.error('Failed to save voice recording. Please try again.');
    }
  };

  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <div key={block.id} className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <RichTextEditor
              content={processContent(block.content || '')}
              readOnly={true}
              className="bg-transparent"
            />
          </div>
        );
      case 'video':
        return block.fileId ? (
          <div key={block.id} className="mb-6">
            <VideoPlayer 
              fileId={block.fileId} 
              title={block.title} 
              startAt={videoStartAtSeconds}
              onProgress={onVideoProgress}
            />
          </div>
        ) : null;
      case 'audio':
        return block.fileId ? (
          <div key={block.id} className="mb-6">
             <AudioPlayer 
               src={`${baseUrl}/api/v1/files/${block.fileId}/stream?token=${token}`} 
               title={block.title} 
             />
          </div>
        ) : null;
      case 'document':
        return block.fileId ? (
          <div key={block.id} className="h-[600px] mb-6">
            <DocumentViewer
              fileId={block.fileId}
              fileName={block.fileName || 'Document'}
              fileType={block.mimeType || 'application/pdf'}
              title={block.title}
            />
          </div>
        ) : null;
      case 'drawing':
        return (
          <div key={block.id} className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{block.title || 'Draw your answer'}</h3>
            <DrawingCanvas
              width={800}
              height={600}
              onSave={(dataUrl) => handleDrawingSave(dataUrl, block.id)}
            />
          </div>
        );
      case 'voice':
        return (
          <div key={block.id} className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{block.title || 'Record your answer'}</h3>
            <VoiceRecorder
              onSave={(blob) => handleVoiceSave(blob, block.id)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // If we have structured blocks, render them
  if (blocks && blocks.length > 0) {
    return (
      <div className="lesson-content-blocks">
        {blocks.sort((a, b) => a.order - b.order).map(renderBlock)}
      </div>
    );
  }

  // Fallback for legacy content
  if (contentType === 'text' || (!contentType && content)) {
     return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <RichTextEditor
            content={processContent(content || '')}
            readOnly={true}
            className="bg-transparent"
          />
        </div>
     );
  }

  return null;
}
