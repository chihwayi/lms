import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Eraser, Pencil, Trash2, Download, Undo } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  onSave?: (dataUrl: string) => void;
}

const COLORS = [
  '#000000', // Black
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#FFFFFF', // White
];

export function DrawingCanvas({ 
  width = 800, 
  height = 600, 
  className,
  onSave 
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Set white background initially
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    ctx.lineWidth = lineWidth;
  }, [color, lineWidth, tool]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setHistory(prev => [...prev.slice(-10), canvas.toDataURL()]);
  };

  const undo = () => {
    if (history.length <= 1) return;
    
    const newHistory = [...history];
    newHistory.pop(); // Remove current state
    const previousState = newHistory[newHistory.length - 1];
    
    setHistory(newHistory);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const handleSave = () => {
    if (onSave && canvasRef.current) {
      onSave(canvasRef.current.toDataURL());
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-100 rounded-lg border border-slate-200">
        <div className="flex gap-2">
          <Button
            variant={tool === 'pencil' ? "default" : "outline"}
            size="icon"
            onClick={() => setTool('pencil')}
            title="Pencil"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant={tool === 'eraser' ? "default" : "outline"}
            size="icon"
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-8 w-px bg-slate-300" />

        <div className="flex gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                color === c && tool === 'pencil' ? "border-slate-900 scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: c }}
              onClick={() => {
                setColor(c);
                setTool('pencil');
              }}
              title={c}
            />
          ))}
        </div>

        <div className="h-8 w-px bg-slate-300" />

        <div className="flex items-center gap-2 w-32">
          <div className="w-2 h-2 bg-black rounded-full" />
          <Slider
            value={[lineWidth]}
            onValueChange={(vals) => setLineWidth(vals[0])}
            min={1}
            max={20}
            step={1}
            className="flex-1"
          />
          <div className="w-4 h-4 bg-black rounded-full" />
        </div>

        <div className="flex-1" />

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={undo} disabled={history.length <= 1} title="Undo">
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={clearCanvas} title="Clear">
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
          {onSave && (
            <Button onClick={handleSave} className="gap-2">
              <Download className="w-4 h-4" />
              Save
            </Button>
          )}
        </div>
      </div>

      <div className="relative rounded-lg border-2 border-slate-200 overflow-hidden shadow-inner bg-white touch-none">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
      </div>
    </div>
  );
}
