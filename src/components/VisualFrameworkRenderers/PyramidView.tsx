import React from 'react';
import { FrameworkData } from '../../types/decision';
import { Layers } from 'lucide-react';

interface PyramidViewProps {
  frameworkData: FrameworkData;
}

export const PyramidView: React.FC<PyramidViewProps> = ({ frameworkData }) => {
  const levels = frameworkData.pyramidLevels || [];

  if (levels.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-stone-100 text-stone-600 text-sm italic">
        Hierarchy framework data rendered in summary view.
      </div>
    );
  }

  const statusColors = {
    fulfilled: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'at-risk': 'bg-amber-100 text-amber-800 border-amber-300',
    blocker: 'bg-rose-100 text-rose-800 border-rose-300',
    opportunity: 'bg-sky-100 text-sky-800 border-sky-300',
  };

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {levels.map((lvl, idx) => {
        const widthPercent = 100 - idx * 12; // Top is narrower, bottom is wider
        return (
          <div
            key={idx}
            className="mx-auto transition-all"
            style={{ width: `${Math.max(widthPercent, 50)}%` }}
          >
            <div className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-sm flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-2.5">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-stone-100 font-bold text-xs flex items-center justify-center">
                  {levels.length - idx}
                </span>
                <div>
                  <h5 className="font-serif font-bold text-stone-900 text-sm">{lvl.levelName}</h5>
                  <p className="text-xs text-stone-600 leading-snug">{lvl.insight}</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  statusColors[lvl.status] || 'bg-stone-100 text-stone-700'
                }`}
              >
                {lvl.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
