'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

interface AiQuizGeneratorProps {
  onGenerate: (questions: Question[]) => void;
}

export function AiQuizGenerator({ onGenerate }: AiQuizGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/v1/ai/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic,
          difficulty,
          count,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate quiz');
      
      const data = await res.json();
      
      // Transform API data to Question format
      const newQuestions: Question[] = data.questions.map((q: any) => {
        const options = q.options.map((opt: string) => ({
          id: crypto.randomUUID(),
          text: opt,
        }));
        
        // Assuming API returns correctAnswer index
        const correctOptionId = options[q.correctAnswer]?.id || options[0].id;

        return {
          id: crypto.randomUUID(),
          text: q.question,
          options,
          correctOptionId,
        };
      });

      onGenerate(newQuestions);
      setOpen(false);
      toast.success(`Generated ${newQuestions.length} questions!`);
      
    } catch (error) {
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-violet-200 text-violet-700 hover:bg-violet-50">
          <BrainCircuit className="w-4 h-4" />
          Auto-Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-violet-700">
            <Sparkles className="w-5 h-5" />
            AI Quiz Generator
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="topic">Topic / Context</Label>
            <Input
              id="topic"
              placeholder="e.g. React Hooks, Renaissance Art, Quantum Physics"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <div className="flex justify-between">
              <Label>Number of Questions</Label>
              <span className="text-sm text-slate-500">{count}</span>
            </div>
            <Slider
              value={[count]}
              onValueChange={(vals) => setCount(vals[0])}
              min={1}
              max={10}
              step={1}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleGenerate} disabled={loading} className="bg-violet-600 hover:bg-violet-700">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Quiz'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
