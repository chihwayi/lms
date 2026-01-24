'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save, Type, Upload, MousePointer2 } from 'lucide-react';

interface CertificateElement {
  id: string;
  type: 'text' | 'image' | 'date';
  field: 'student_name' | 'course_title' | 'completion_date' | 'instructor_name' | 'custom_text';
  label: string;
  x: number;
  y: number;
  width?: number;
  fontSize?: number;
  fontColor?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  text?: string;
}

const ELEMENT_TYPES = [
  { field: 'student_name', label: 'Student Name' },
  { field: 'course_title', label: 'Course Title' },
  { field: 'completion_date', label: 'Completion Date' },
  { field: 'instructor_name', label: 'Instructor Name' },
  { field: 'custom_text', label: 'Custom Text' },
];

export default function CreateCertificateTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [elements, setElements] = useState<CertificateElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient('/certificates/upload-background', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setBackgroundUrl(data.url);
        toast.success('Background uploaded');
      } else {
        toast.error('Upload failed');
      }
    } catch (error) {
      toast.error('Upload error');
    }
  };

  const addElement = (type: any) => {
    const newElement: CertificateElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text', // Default to text for now
      field: type.field,
      label: type.label,
      x: 50,
      y: 50,
      fontSize: 24,
      fontColor: '#000000',
      textAlign: 'center',
      text: type.field === 'custom_text' ? 'Custom Text' : undefined
    };
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const updateSelectedElement = (updates: Partial<CertificateElement>) => {
    if (!selectedElementId) return;
    setElements(elements.map(el => 
      el.id === selectedElementId ? { ...el, ...updates } : el
    ));
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedElementId(id);
    setIsDragging(true);
    
    // Calculate offset
    const element = elements.find(el => el.id === id);
    if (element && canvasRef.current) {
        // Just storing initial click doesn't help much with delta, 
        // simpler to track mouse position
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElementId || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    // Update position (center the element on mouse for simplicity, or implement proper offset)
    // For now, let's just set x/y to mouse pos relative to canvas
    setElements(elements.map(el => 
      el.id === selectedElementId ? { ...el, x, y } : el
    ));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const saveTemplate = async () => {
    if (!name || !backgroundUrl) {
      toast.error('Name and Background are required');
      return;
    }

    try {
      const response = await apiClient('/certificates/templates', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          background_url: backgroundUrl,
          elements,
          is_default: false
        }),
      });

      if (response.ok) {
        toast.success('Template saved');
        router.push('/admin/certificates');
      } else {
        toast.error('Failed to save');
      }
    } catch (error) {
      toast.error('Error saving template');
    }
  };

  const selectedElement = elements.find(el => el.id === selectedElementId);

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-80px)] flex flex-col" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Create Certificate Template</h1>
        </div>
        <Button onClick={saveTemplate}>
          <Save className="h-4 w-4 mr-2" /> Save Template
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 h-full">
        {/* Left Panel: Settings */}
        <div className="col-span-3 space-y-6 overflow-y-auto pr-2">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Modern Certificate" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label>Background Image</Label>
                <div className="flex gap-2">
                  <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" /> Upload Image
                  </Button>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                </div>
                {backgroundUrl && (
                  <div className="mt-2 text-xs text-muted-foreground break-all">
                    {backgroundUrl.split('/').pop()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedElement && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold border-b pb-2 mb-4">Element Properties</h3>
                
                <div className="space-y-2">
                  <Label>Text (for preview)</Label>
                  {selectedElement.field === 'custom_text' ? (
                     <Input 
                       value={selectedElement.text || ''} 
                       onChange={e => updateSelectedElement({ text: e.target.value })} 
                     />
                  ) : (
                     <div className="text-sm text-muted-foreground bg-slate-100 p-2 rounded">
                       {selectedElement.label} (Dynamic)
                     </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Font Size: {selectedElement.fontSize}px</Label>
                  <Slider 
                    value={[selectedElement.fontSize || 16]} 
                    min={8} 
                    max={72} 
                    step={1} 
                    onValueChange={([val]) => updateSelectedElement({ fontSize: val })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      value={selectedElement.fontColor} 
                      onChange={e => updateSelectedElement({ fontColor: e.target.value })} 
                      className="w-12 h-8 p-1"
                    />
                    <Input 
                      value={selectedElement.fontColor} 
                      onChange={e => updateSelectedElement({ fontColor: e.target.value })} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                   <div className="space-y-1">
                     <Label>X Position</Label>
                     <Input 
                       type="number" 
                       value={Math.round(selectedElement.x)} 
                       onChange={e => updateSelectedElement({ x: Number(e.target.value) })} 
                     />
                   </div>
                   <div className="space-y-1">
                     <Label>Y Position</Label>
                     <Input 
                       type="number" 
                       value={Math.round(selectedElement.y)} 
                       onChange={e => updateSelectedElement({ y: Number(e.target.value) })} 
                     />
                   </div>
                </div>

                <Button 
                  variant="destructive" 
                  className="w-full mt-4"
                  onClick={() => {
                    setElements(elements.filter(el => el.id !== selectedElement.id));
                    setSelectedElementId(null);
                  }}
                >
                  Remove Element
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Center Panel: Canvas */}
        <div className="col-span-7 flex items-center justify-center bg-slate-100 rounded-lg p-4 overflow-auto">
          <div 
            ref={canvasRef}
            className="relative bg-white shadow-lg overflow-hidden"
            style={{
              width: '800px',
              height: '600px',
              backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!backgroundUrl && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                Upload a background image to start
              </div>
            )}
            
            {elements.map(el => (
              <div
                key={el.id}
                onMouseDown={(e) => handleMouseDown(e, el.id)}
                className={`absolute cursor-move select-none whitespace-nowrap px-2 py-1 border ${
                  selectedElementId === el.id ? 'border-blue-500 bg-blue-50/20' : 'border-transparent hover:border-slate-300'
                }`}
                style={{
                  left: el.x,
                  top: el.y,
                  fontSize: el.fontSize,
                  color: el.fontColor,
                  fontFamily: el.fontFamily,
                  textAlign: el.textAlign,
                  transform: 'translate(-50%, -50%)' // Center anchor point
                }}
              >
                {el.field === 'custom_text' ? el.text : `{${el.label}}`}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Tools */}
        <div className="col-span-2 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Add Elements</h3>
              <div className="space-y-2">
                {ELEMENT_TYPES.map(type => (
                  <Button 
                    key={type.field} 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => addElement(type)}
                  >
                    <Type className="h-4 w-4 mr-2" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
