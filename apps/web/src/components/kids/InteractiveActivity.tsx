'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type MatchItem = {
  id: string;
  label: string;
};

type MatchTarget = {
  id: string;
  label: string;
  acceptsId: string;
};

type InteractiveData = {
  items: MatchItem[];
  targets: MatchTarget[];
  title?: string;
  shuffle?: boolean;
};

interface InteractiveActivityProps {
  data?: InteractiveData;
  onComplete?: (results: any) => void;
}

export function InteractiveActivity({ data, onComplete }: InteractiveActivityProps) {
  const defaultData: InteractiveData = useMemo(
    () => ({
      title: 'Match the shapes!',
      items: [
        { id: 'circle', label: 'Circle' },
        { id: 'square', label: 'Square' },
        { id: 'triangle', label: 'Triangle' },
      ],
      targets: [
        { id: 't1', label: '◯', acceptsId: 'circle' },
        { id: 't2', label: '▢', acceptsId: 'square' },
        { id: 't3', label: '△', acceptsId: 'triangle' },
      ],
      shuffle: true,
    }),
    []
  );

  const config = data && data.items?.length && data.targets?.length ? data : defaultData;
  const [assignments, setAssignments] = useState<Record<string, string | null>>({});
  const [itemsOrder, setItemsOrder] = useState<MatchItem[]>(
    (config.shuffle ? [...config.items].sort(() => Math.random() - 0.5) : config.items)
  );
  const [checked, setChecked] = useState(false);

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
    e.dataTransfer.setData('text/plain', itemId);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    const itemId = e.dataTransfer.getData('text/plain');
    if (!itemId) return;
    setAssignments((prev) => ({ ...prev, [targetId]: itemId }));
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const resetAll = () => {
    setAssignments({});
    setChecked(false);
  };

  const shuffleItems = () => {
    setItemsOrder((prev) => [...prev].sort(() => Math.random() - 0.5));
    setChecked(false);
  };

  const checkAnswers = () => {
    let correctCount = 0;
    for (const t of config.targets) {
      const assigned = assignments[t.id];
      if (assigned === t.acceptsId) correctCount++;
    }
    setChecked(true);
    
    const total = config.targets.length;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = correctCount === total;

    if (passed) {
      toast.success('Great job! All matches are correct!');
    } else {
      toast.info(`${correctCount}/${total} correct. Keep trying!`);
    }

    if (onComplete) {
      onComplete({
        score,
        assignments,
        passed,
        correctCount,
        total,
      });
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">{config.title || 'Interactive Activity'}</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={shuffleItems}>Shuffle</Button>
          <Button variant="outline" onClick={resetAll}>Reset</Button>
          <Button onClick={checkAnswers}>Check Answers</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-semibold text-gray-500 mb-3">Items</h4>
          <div className="flex flex-wrap gap-3">
            {itemsOrder.map((item) => {
              const isAssigned = Object.values(assignments).includes(item.id);
              return (
                <div
                  key={item.id}
                  draggable={!isAssigned}
                  onDragStart={(e) => onDragStart(e, item.id)}
                  className={cn(
                    'px-4 py-2 rounded-xl border text-sm font-medium cursor-grab bg-gray-50',
                    isAssigned ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'
                  )}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-500 mb-3">Targets</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {config.targets.map((target) => {
              const assigned = assignments[target.id];
              const isCorrect = checked && assigned === target.acceptsId;
              const isWrong = checked && assigned && assigned !== target.acceptsId;
              return (
                <div
                  key={target.id}
                  onDrop={(e) => onDrop(e, target.id)}
                  onDragOver={onDragOver}
                  className={cn(
                    'rounded-2xl border-2 p-4 min-h-[64px] flex items-center justify-center text-2xl bg-gray-50 transition-colors',
                    !assigned && 'border-gray-300',
                    assigned && !checked && 'border-blue-300 bg-blue-50',
                    isCorrect && 'border-green-500 bg-green-50',
                    isWrong && 'border-red-500 bg-red-50'
                  )}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{target.label}</div>
                    <div className="text-sm text-gray-500">
                      {assigned ? itemsOrder.find((i) => i.id === assigned)?.label : 'Drop here'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
