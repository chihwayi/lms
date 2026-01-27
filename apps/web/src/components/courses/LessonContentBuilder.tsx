'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { FileUpload } from './FileUpload';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { 
  Plus, 
  Type, 
  Video, 
  Music, 
  FileText, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Save,
  Loader2,
  Paperclip,
  Pencil,
  Check
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContentBlock {
  id: string;
  type: 'text' | 'video' | 'audio' | 'document' | 'image' | 'quiz';
  content?: string;
  fileId?: string;
  fileName?: string;
  mimeType?: string;
  title?: string;
  order: number;
}

interface LessonContentBuilderProps {
  courseId: string;
  lessonId: string;
  initialContent?: any;
  onUpdate?: (updatedLesson: any) => void;
}

export function LessonContentBuilder({ 
  courseId, 
  lessonId, 
  initialContent,
  onUpdate 
}: LessonContentBuilderProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<any[]>([]);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const processContent = (html: string) => {
    if (!html) return '';
    return html.replace(/\$([^$]+)\$/g, (match, equation) => {
      return `<span data-type="mathematics" data-content="${equation.replace(/"/g, '&quot;')}"></span>`;
    });
  };

  useEffect(() => {
    if (initialContent?.content_data?.blocks) {
      setBlocks(initialContent.content_data.blocks);
    } else if (initialContent?.content_data) {
      // Migrate legacy content to blocks
      const legacy = initialContent.content_data;
      const newBlocks: ContentBlock[] = [];
      
      if (legacy.html || legacy.content) {
        newBlocks.push({
          id: crypto.randomUUID(),
          type: 'text',
          content: legacy.html || legacy.content,
          order: 0
        });
      }
      
      if (legacy.fileId) {
        newBlocks.push({
          id: crypto.randomUUID(),
          type: legacy.fileType === 'video' ? 'video' : 'document', // Simplified mapping
          fileId: legacy.fileId,
          fileName: legacy.fileName,
          title: legacy.title,
          order: 1
        });
      }
      
      if (newBlocks.length > 0) {
        setBlocks(newBlocks);
      }
    }
  }, [initialContent]);

  useEffect(() => {
    fetchCourseFiles();
  }, [courseId]);

  const fetchCourseFiles = async () => {
    try {
      const res = await apiClient(`/api/v1/files/course/${courseId}`);
      if (res.ok) {
        setAvailableFiles(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch files', error);
    }
  };

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      content: '',
      order: blocks.length,
      title: type === 'text' ? 'Text Content' : `New ${type}`
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === blocks.length - 1)
    ) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    
    // Update order property
    newBlocks.forEach((b, i) => b.order = i);
    setBlocks(newBlocks);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient(`/api/v1/courses/lessons/${lessonId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          content_data: {
            blocks: blocks.map((b, i) => ({ ...b, order: i }))
          }
        }),
      });

      if (response.ok) {
        const updatedLesson = await response.json();
        toast.success('Lesson content saved successfully');
        onUpdate?.(updatedLesson);
      } else {
        toast.error('Failed to save content');
      }
    } catch (error) {
      toast.error('Error saving content');
    } finally {
      setIsLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <Paperclip className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Lesson Content</h3>
          <p className="text-xs text-gray-500 mt-1">
            Mix rich text, video, audio and documents for this lesson.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Content
        </Button>
      </div>

      <div className="space-y-4">
        {blocks.map((block, index) => {
          const filteredFiles = availableFiles.filter(f => {
            if (block.type === 'video') return f.mimetype?.startsWith('video/');
            if (block.type === 'audio') return f.mimetype?.startsWith('audio/');
            return true;
          });

          return (
          <Card key={block.id} className="relative group">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-gray-50/50 border-b">
              <div className="flex items-center gap-2 font-medium text-sm text-gray-700">
                {getIconForType(block.type)}
                <span className="capitalize">{block.type} Block</span>
              </div>
              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveBlock(index, 'up')} disabled={index === 0}>
                  <MoveUp className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1}>
                  <MoveDown className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeBlock(block.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {block.type === 'text' ? (
                <div className="space-y-3">
                  {editingBlockId === block.id ? (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                      <RichTextEditor
                        content={block.content || ''}
                        onChange={(html) => updateBlock(block.id, { content: html })}
                      />
                      <div className="flex justify-end mt-2">
                        <Button 
                          size="sm" 
                          onClick={() => setEditingBlockId(null)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Done Editing
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="group relative border rounded-md p-4 bg-white min-h-[100px] hover:border-blue-200 transition-colors cursor-pointer"
                      onClick={() => setEditingBlockId(block.id)}
                    >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                         <Button size="sm" variant="secondary" className="h-8 text-xs shadow-sm">
                           <Pencil className="w-3 h-3 mr-1" />
                           Edit
                         </Button>
                      </div>
                      <div className="prose max-w-none">
                        {block.content ? (
                          <RichTextEditor
                            content={processContent(block.content)}
                            readOnly={true}
                            className="border-0 p-0 min-h-0 focus-within:ring-0"
                          />
                        ) : (
                          <p className="text-gray-400 italic">Click to add text content...</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Select File</label>
                      <Select 
                        value={block.fileId} 
                        disabled={filteredFiles.length === 0}
                        onValueChange={(val) => {
                          const file = availableFiles.find(f => f.id === val);
                          updateBlock(block.id, { 
                            fileId: val,
                            fileName: file?.original_name,
                            mimeType: file?.mimetype || file?.mime_type,
                            title: file?.original_name
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a file..." />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredFiles.length === 0 ? (
                            <SelectItem disabled value="__no_files">
                              No {block.type} files yet – upload below.
                            </SelectItem>
                          ) : (
                            filteredFiles.map(file => (
                              <SelectItem key={file.id} value={file.id}>
                                {file.original_name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Display Title</label>
                      <input
                        type="text"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        value={block.title || ''}
                        onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                        placeholder={
                          block.type === 'video'
                            ? 'e.g. Distance formula walkthrough video'
                            : block.type === 'audio'
                            ? 'e.g. Explanation audio for this lesson'
                            : 'e.g. Worked examples handout'
                        }
                      />
                      <p className="mt-1 text-[11px] text-gray-400">
                        Students will see this title above the {block.type === 'video' ? 'video player' : block.type === 'audio' ? 'audio player' : 'document viewer'}.
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                     <p className="text-xs text-gray-500 mb-2">Or upload a new file:</p>
                     <FileUpload
                       courseId={courseId}
                       lessonId={lessonId}
                       acceptedTypes={
                         block.type === 'video' ? ['.mp4', '.webm'] :
                         block.type === 'audio' ? ['.mp3', '.wav', '.m4a'] :
                         ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.png']
                       }
                       onUploadComplete={(file) => {
                         setAvailableFiles(prev => [...prev, file]);
                         updateBlock(block.id, {
                           fileId: file.id,
                           fileName: file.original_name,
                           mimeType: file.mimetype || file.mime_type,
                           title: file.original_name
                         });
                       }}
                     />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )})}

        {blocks.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <p className="text-gray-500">No content blocks added yet.</p>
            <p className="text-sm text-gray-400">Add blocks to build your lesson content.</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" onClick={() => addBlock('text')}>
            <Type className="w-5 h-5" />
            <span>Add Text</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200" onClick={() => addBlock('video')}>
            <Video className="w-5 h-5" />
            <span>Add Video</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200" onClick={() => addBlock('audio')}>
            <Music className="w-5 h-5" />
            <span>Add Audio</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200" onClick={() => addBlock('document')}>
            <FileText className="w-5 h-5" />
            <span>Add Document</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
