import React from 'react';
import { FrameworkData } from '../../types/decision';
import { TrendingUp, AlertCircle, Compass } from 'lucide-react';

interface CurveStageViewProps {
  frameworkData: FrameworkData;
}

export const CurveStageView: React.FC<CurveStageViewProps> = ({ frameworkData }) => {
  const curve = frameworkData.curve;

  if (!curve) {
    return (
      <div className="p-4 rounded-lg bg-stone-100 text-stone-600 text-sm italic">
        Curve and lifecycle dynamics summarized below.
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl border border-stone-200 bg-white shadow-sm space-y-5">
      {/* Current Stage Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-stone-900 text-stone-100 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-600 text-stone-950 font-bold">
            <TrendingUp className="w-5 h-5 text-stone-950" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
              Current Lifecycle Stage
            </span>
            <h4 className="font-serif font-bold text-lg text-stone-100">{curve.currentStage}</h4>
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700">
          Strategic Assessment
        </span>
      </div>

      {/* Stage Description */}
      <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
        <h5 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">Stage Diagnosis</h5>
        <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">{curve.stageDescription}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Risks at this stage */}
        <div className="p-4 rounded-lg bg-amber-50/80 border border-amber-200 space-y-2">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            <span>Key Vulnerabilities & Risks</span>
          </div>
          <ul className="space-y-1.5 text-xs text-amber-950">
            {curve.keyRisks?.map((risk, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="font-bold text-amber-700">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strategic Recommendation */}
        <div className="p-4 rounded-lg bg-emerald-50/80 border border-emerald-200 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4 text-emerald-700" />
            <span>Recommended Strategic Response</span>
          </div>
          <p className="text-xs text-emerald-950 font-medium leading-relaxed">
            {curve.recommendedStrategy}
          </p>
        </div>
      </div>
    </div>
  );
};
