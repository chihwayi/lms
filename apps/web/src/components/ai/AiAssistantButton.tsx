'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Bot, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AiAssistantButtonProps {
  context: string;
  title: string;
}

export function AiAssistantButton({ context, title }: AiAssistantButtonProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResponse('');

    try {
      const res = await apiClient('/ai/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: query,
          context: `Lesson: ${title}\n\nContent: ${context.substring(0, 1000)}...`, // Truncate context
        }),
      });

      if (!res.ok) throw new Error('Failed to get explanation');
      const data = await res.json();
      setResponse(data.explanation);
    } catch (error) {
      setResponse('Sorry, I encountered an error while trying to explain that.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-violet-600 border-violet-200 hover:bg-violet-50">
          <Sparkles className="w-4 h-4" />
          AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-violet-700">
            <Bot className="w-5 h-5" />
            Learning Assistant
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-slate-50 p-4 rounded-lg min-h-[200px] border border-slate-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            ) : response ? (
              <ScrollArea className="h-[200px] pr-4">
                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                  {response}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center text-sm px-4">
                <Sparkles className="w-8 h-8 mb-2 opacity-50" />
                <p>Ask me to explain concepts, summarize the lesson, or give examples!</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Textarea 
              placeholder="What would you like me to explain?" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
            />
            <Button 
              className="h-auto bg-violet-600 hover:bg-violet-700" 
              onClick={handleAsk}
              disabled={loading || !query.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
