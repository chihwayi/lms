
import React from 'react';
import { VideoPlayer } from './VideoPlayer';
import { DocumentViewer } from './DocumentViewer';
import { AudioPlayer } from './AudioPlayer';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useAuthStore } from '@/lib/auth-store';
import { useConfigStore } from '@/lib/config-store';

export interface ContentBlock {
  id: string;
  type: 'text' | 'video' | 'audio' | 'document' | 'image' | 'quiz';
  content?: string; // For text
  fileId?: string; // For media
  fileName?: string;
  mimeType?: string;
  title?: string;
  data?: any;
  order: number;
}

interface LessonContentRendererProps {
  blocks?: ContentBlock[];
  // Legacy support
  content?: string;
  contentType?: string;
  contentData?: any;
}

export function LessonContentRenderer({ blocks, content, contentType, contentData }: LessonContentRendererProps) {
  const { accessToken: token } = useAuthStore();
  const { instanceUrl } = useConfigStore();
  const baseUrl = instanceUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const processContent = (html: string) => {
    if (!html) return '';
    return html.replace(/\$([^$]+)\$/g, (match, equation) => {
      return `<span data-type="mathematics" data-content="${equation.replace(/"/g, '&quot;')}"></span>`;
    });
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
            <VideoPlayer fileId={block.fileId} title={block.title} />
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
