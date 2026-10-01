import React from 'react';
import { FrameworkData } from '../../types/decision';
import { Sparkles } from 'lucide-react';

interface SCAMPERViewProps {
  frameworkData: FrameworkData;
}

export const SCAMPERView: React.FC<SCAMPERViewProps> = ({ frameworkData }) => {
  const elements = frameworkData.scamper || [];

  if (elements.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-stone-100 text-stone-600 text-sm italic">
        Creative reframing elements summarized below.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {elements.map((elem, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-stone-200 bg-white shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-all"
          >
            <div>
              <div className="flex items-center space-x-2 pb-2 border-b border-stone-100">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  {elem.category?.charAt(0) || '*'}
                </span>
                <span className="font-serif font-bold text-stone-900 text-sm">{elem.category}</span>
              </div>

              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-emerald-900 bg-emerald-50 p-2 rounded border border-emerald-100">
                  Concept: {elem.concept}
                </p>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {elem.applicationToDecision}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
