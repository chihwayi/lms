'use client';

import React, { useEffect, useRef } from 'react';
import functionPlot from 'function-plot';

interface MathGraphProps {
  functions: Array<{
    fn: string;
    color?: string;
    range?: [number, number];
  }>;
  width?: number;
  height?: number;
  xDomain?: [number, number];
  yDomain?: [number, number];
  title?: string;
}

export const MathGraphRenderer: React.FC<MathGraphProps> = ({
  functions,
  width = 600,
  height = 400,
  xDomain = [-10, 10],
  yDomain = [-10, 10],
  title
}) => {
  const rootEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootEl.current) return;

    try {
      functionPlot({
        target: rootEl.current,
        width,
        height,
        grid: true,
        title,
        xAxis: { domain: xDomain, label: 'x' },
        yAxis: { domain: yDomain, label: 'y' },
        data: functions.map(f => ({
          fn: f.fn,
          color: f.color,
          range: f.range
        }))
      });
    } catch (err) {
      console.error('Failed to render graph:', err);
    }
  }, [functions, width, height, xDomain, yDomain, title]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm my-6">
      {title && <h4 className="text-lg font-semibold mb-4 text-gray-800">{title}</h4>}
      <div ref={rootEl} className="overflow-hidden rounded-lg" />
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {functions.map((f, i) => (
          <div key={i} className="flex items-center text-sm text-gray-600">
            <span 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: f.color || 'steelblue' }} // default color in function-plot is steelblue-ish
            />
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{f.fn}</code>
          </div>
        ))}
      </div>
    </div>
  );
};
