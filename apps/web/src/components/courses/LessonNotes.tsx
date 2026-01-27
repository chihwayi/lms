'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface LessonNotesProps {
  lessonId: string;
}

export function LessonNotes({ lessonId }: LessonNotesProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    loadNote();
  }, [lessonId]);

  const loadNote = async () => {
    setLoading(true);
    try {
      const res = await apiClient(`lessons/${lessonId}/note`);
      if (res.ok) {
        const data = await res.json();
        setNote(data?.content || '');
      } else {
        setNote('');
      }
    } catch (error) {
      console.error('Failed to load note', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    setSaving(true);
    try {
      const res = await apiClient(`lessons/${lessonId}/note`, {
        method: 'PUT',
        body: JSON.stringify({ content: note }),
      });
      if (res.ok) {
        setLastSaved(new Date().toLocaleTimeString());
        toast.success('Note saved');
      } else {
        toast.error('Failed to save note');
      }
    } catch (error) {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="h-32 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">My Notes</h3>
        <div className="flex items-center gap-2">
            {lastSaved && <span className="text-xs text-muted-foreground">Saved at {lastSaved}</span>}
            <Button size="sm" onClick={saveNote} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save
            </Button>
        </div>
      </div>
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Type your notes here... (Private to you)"
        className="min-h-[150px] font-sans"
      />
    </div>
  );
}
