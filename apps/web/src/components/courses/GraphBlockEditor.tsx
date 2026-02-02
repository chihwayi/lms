import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { MathGraphRenderer } from './MathGraphRenderer';

interface GraphBlockEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export function GraphBlockEditor({ data, onChange }: GraphBlockEditorProps) {
  const functions = data?.functions || [];
  const xDomain = data?.xDomain || [-10, 10];
  const yDomain = data?.yDomain || [-10, 10];
  const title = data?.title || '';

  const addFunction = () => {
    onChange({
      ...data,
      functions: [...functions, { fn: '', color: '#3b82f6' }]
    });
  };

  const updateFunction = (index: number, updates: any) => {
    const newFunctions = [...functions];
    newFunctions[index] = { ...newFunctions[index], ...updates };
    onChange({ ...data, functions: newFunctions });
  };

  const removeFunction = (index: number) => {
    const newFunctions = functions.filter((_: any, i: number) => i !== index);
    onChange({ ...data, functions: newFunctions });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div>
          <Label>Graph Title</Label>
          <Input 
            value={title} 
            onChange={(e) => onChange({ ...data, title: e.target.value })} 
            placeholder="e.g. Solving Systems of Equations"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>X Axis Domain (Min, Max)</Label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                value={xDomain[0]} 
                onChange={(e) => onChange({ ...data, xDomain: [Number(e.target.value), xDomain[1]] })} 
              />
              <Input 
                type="number" 
                value={xDomain[1]} 
                onChange={(e) => onChange({ ...data, xDomain: [xDomain[0], Number(e.target.value)] })} 
              />
            </div>
          </div>
          <div>
            <Label>Y Axis Domain (Min, Max)</Label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                value={yDomain[0]} 
                onChange={(e) => onChange({ ...data, yDomain: [Number(e.target.value), yDomain[1]] })} 
              />
              <Input 
                type="number" 
                value={yDomain[1]} 
                onChange={(e) => onChange({ ...data, yDomain: [yDomain[0], Number(e.target.value)] })} 
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Functions</Label>
            <Button size="sm" variant="outline" onClick={addFunction}>
              <Plus className="w-4 h-4 mr-2" />
              Add Function
            </Button>
          </div>
          
          <div className="space-y-3">
            {functions.map((fn: any, idx: number) => (
              <div key={idx} className="flex gap-2 items-start">
                <div className="grid gap-2 flex-1">
                  <Input 
                    placeholder="Equation (e.g. x^2 or sin(x))" 
                    value={fn.fn} 
                    onChange={(e) => updateFunction(idx, { fn: e.target.value })} 
                  />
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      className="h-9 w-9 p-1 rounded border cursor-pointer"
                      value={fn.color || '#3b82f6'}
                      onChange={(e) => updateFunction(idx, { color: e.target.value })}
                    />
                    <Input 
                      placeholder="Color hex" 
                      className="w-32"
                      value={fn.color || '#3b82f6'} 
                      onChange={(e) => updateFunction(idx, { color: e.target.value })} 
                    />
                  </div>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-red-500 mt-1"
                  onClick={() => removeFunction(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {functions.length === 0 && (
          <p className="text-sm text-gray-500 italic">No functions added. Click &quot;Add Function&quot; to start plotting.</p>
        )}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <Label className="mb-2 block">Preview</Label>
        <div className="bg-white rounded border flex justify-center">
          <MathGraphRenderer 
            functions={functions}
            xDomain={xDomain}
            yDomain={yDomain}
            title={title}
            width={500}
            height={300}
          />
        </div>
      </div>
    </div>
  );
}
