'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface FeedbackDialogProps {
  sessionId: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function FeedbackDialog({ sessionId, onSuccess, trigger }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient(`/mentorship/sessions/${sessionId}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ rating, feedback }),
      });

      if (res.ok) {
        toast.success('Feedback submitted successfully');
        setOpen(false);
        onSuccess();
      } else {
        toast.error('Failed to submit feedback');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" size="sm">Rate Session</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Rate this Session</DialogTitle>
          <DialogDescription>
            How was your mentorship session? Your feedback helps improve the experience.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`transition-all hover:scale-110 focus:outline-none ${rating >= star ? 'text-yellow-400' : 'text-slate-300'}`}
              >
                <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
              </button>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback">Comments (Optional)</Label>
            <Textarea
              id="feedback"
              placeholder="What did you learn? Any suggestions?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="bg-slate-50"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || rating === 0} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
