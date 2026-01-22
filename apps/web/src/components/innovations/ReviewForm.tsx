'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

interface ReviewFormProps {
  innovationId: string;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ innovationId, onReviewSubmitted }: ReviewFormProps) {
  const [score, setScore] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/innovations/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          innovation_id: innovationId,
          score: parseInt(score),
          comments
        })
      });

      if (res.ok) {
        toast.success('Review submitted successfully');
        onReviewSubmitted();
        setScore('');
        setComments('');
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-6 rounded-lg border">
      <h3 className="text-lg font-semibold">Submit Review</h3>
      
      <div className="space-y-2">
        <Label htmlFor="score">Score (0-100)</Label>
        <Input
          id="score"
          type="number"
          min="0"
          max="100"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments">Comments</Label>
        <Textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Provide feedback..."
          rows={4}
        />
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}
