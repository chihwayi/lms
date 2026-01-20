'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface ReorderableListProps {
  items: any[];
  type: 'modules' | 'lessons';
  courseId?: string;
  moduleId?: string;
  onReorder: (newOrder: any[]) => void;
  renderItem: (item: any, index: number) => React.ReactNode;
}

export function ReorderableList({ items, type, courseId, moduleId, onReorder, renderItem }: ReorderableListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    
    // Remove dragged item and insert at new position
    newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    // Update order indices
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order_index: index + 1
    }));

    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'modules' 
        ? `/api/v1/courses/${courseId}/modules/reorder`
        : `/api/v1/courses/modules/${moduleId}/lessons/reorder`;
      
      const body = type === 'modules'
        ? { moduleIds: reorderedItems.map(item => item.id) }
        : { lessonIds: reorderedItems.map(item => item.id) };

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        onReorder(reorderedItems);
        toast.success(`${type === 'modules' ? 'Modules' : 'Lessons'} reordered successfully!`);
      } else {
        toast.error(`Failed to reorder ${type}`);
      }
    } catch (error) {
      toast.error(`Failed to reorder ${type}`);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          className={`transition-all duration-200 ${
            draggedIndex === index ? 'opacity-50 scale-95' : ''
          } ${
            dragOverIndex === index && draggedIndex !== index ? 'border-t-4 border-blue-500' : ''
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <GripVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1">
              {renderItem(item, index)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}