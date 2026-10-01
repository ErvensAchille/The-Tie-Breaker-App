import React from 'react';
import { FrameworkData } from '../../types/decision';
import { ArrowRight, HelpCircle, Lightbulb } from 'lucide-react';

interface StepsFrameworkViewProps {
  frameworkData: FrameworkData;
}

export const StepsFrameworkView: React.FC<StepsFrameworkViewProps> = ({ frameworkData }) => {
  const steps = frameworkData.steps || [];

  if (steps.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-stone-100 text-stone-600 text-sm italic">
        Sequential framework guidance generated in summary.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-stone-200 bg-white shadow-sm flex flex-col md:flex-row md:items-start space-y-3 md:space-y-0 md:space-x-4 relative overflow-hidden"
          >
            {/* Step Number Badge */}
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-stone-900 text-emerald-400 font-serif font-bold text-lg shadow">
              {idx + 1}
            </div>

            {/* Step Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-stone-900 text-base">{step.stepName}</h4>
                {idx < steps.length - 1 && (
                  <span className="hidden md:flex items-center text-xs text-stone-400 font-medium">
                    <span>Next Phase</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 text-stone-400" />
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-700 leading-relaxed">{step.guidance}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-stone-100">
                {step.keyQuestion && (
                  <div className="flex items-start space-x-2 bg-amber-50/70 p-2 rounded-lg text-xs text-amber-900 border border-amber-100">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold block text-[10px] uppercase text-amber-800">Key Question:</span>
                      <span>{step.keyQuestion}</span>
                    </div>
                  </div>
                )}

                {step.actionableTip && (
                  <div className="flex items-start space-x-2 bg-emerald-50/70 p-2 rounded-lg text-xs text-emerald-900 border border-emerald-100">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold block text-[10px] uppercase text-emerald-800">Action Tip:</span>
                      <span>{step.actionableTip}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
