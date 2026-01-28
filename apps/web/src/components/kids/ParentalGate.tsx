'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';

interface ParentalGateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ParentalGate({ isOpen, onClose, onSuccess }: ParentalGateProps) {
  const [problem, setProblem] = useState({ a: 0, b: 0 });
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Generate new problem (simple multiplication or addition)
      const a = Math.floor(Math.random() * 8) + 2; // 2-9
      const b = Math.floor(Math.random() * 8) + 2; // 2-9
      setProblem({ a, b });
      setAnswer('');
      setError(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = problem.a * problem.b;
    if (parseInt(answer) === expected) {
      toast.success('Access Granted');
      onSuccess();
    } else {
      setError(true);
      toast.error('Incorrect answer. Try again.');
      setAnswer('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl border-4 border-gray-200">
        <DialogHeader>
          <div className="mx-auto bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-gray-500" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">Parents Only</DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            Please solve this problem to continue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex items-center justify-center gap-4 text-3xl font-black text-gray-800">
            <span>{problem.a}</span>
            <span>×</span>
            <span>{problem.b}</span>
            <span>=</span>
            <Input
              type="number"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                setError(false);
              }}
              className={`w-24 text-center text-2xl h-14 rounded-xl border-2 ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              autoFocus
              placeholder="?"
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-12 rounded-xl bg-gray-900 hover:bg-black text-white">
              <Unlock className="w-4 h-4 mr-2" />
              Unlock
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
