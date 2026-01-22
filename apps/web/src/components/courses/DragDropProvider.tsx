'use client';

import { createContext, useContext, useState } from 'react';

interface DragDropContextType {
  draggedItem: any;
  setDraggedItem: (item: any) => void;
  dropTarget: any;
  setDropTarget: (target: any) => void;
}

const DragDropContext = createContext<DragDropContextType | null>(null);

export function DragDropProvider({ children }: { children: React.ReactNode }) {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  return (
    <DragDropContext.Provider value={{
      draggedItem,
      setDraggedItem,
      dropTarget,
      setDropTarget
    }}>
      {children}
    </DragDropContext.Provider>
  );
}

export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within DragDropProvider');
  }
  return context;
}

export function DraggableItem({ 
  item, 
  type, 
  onReorder, 
  children 
}: { 
  item: any; 
  type: 'module' | 'lesson'; 
  onReorder: (draggedId: string, targetId: string) => void;
  children: React.ReactNode;
}) {
  const { draggedItem, setDraggedItem, setDropTarget } = useDragDrop();

  const handleDragStart = (e: React.DragEvent) => {
    setDraggedItem({ ...item, type });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedItem && draggedItem.id !== item.id && draggedItem.type === type) {
      onReorder(draggedItem.id, item.id);
    }
    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleDragEnter = () => {
    if (draggedItem && draggedItem.type === type) {
      setDropTarget(item.id);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      className="cursor-move"
    >
      {children}
    </div>
  );
}
