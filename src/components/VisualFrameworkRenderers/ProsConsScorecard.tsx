import React from 'react';
import { FrameworkData } from '../../types/decision';
import { CheckCircle, AlertTriangle, Scale } from 'lucide-react';

interface ProsConsScorecardProps {
  frameworkData: FrameworkData;
}

export const ProsConsScorecard: React.FC<ProsConsScorecardProps> = ({ frameworkData }) => {
  const options = frameworkData.optionsComparison || [];

  if (options.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-100 text-slate-600 text-sm italic">
        Comparative scorecard generated in summary format.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((opt, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <h4 className="font-serif font-bold text-slate-900 text-base">{opt.name}</h4>
                </div>
                <div className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                  <Scale className="w-3.5 h-3.5 text-slate-500" />
                  <span>Option {idx + 1}</span>
                </div>
              </div>

              {/* Summary */}
              {opt.summary && (
                <p className="text-xs text-slate-600 mt-3 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {opt.summary}
                </p>
              )}

              {/* Pros & Cons Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {/* Pros */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pros / Upside</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {opt.pros.map((pro, pIdx) => (
                      <li key={pIdx} className="flex items-start space-x-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Cons / Risks</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {opt.cons.map((con, cIdx) => (
                      <li key={cIdx} className="flex items-start space-x-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Score Meters */}
            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <div className="flex justify-between items-center text-[11px] text-slate-600 font-medium mb-1">
                  <span>Impact Score:</span>
                  <span className="font-bold text-slate-900">{opt.impactScore}/10</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${(opt.impactScore / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[11px] text-slate-600 font-medium mb-1">
                  <span>Feasibility:</span>
                  <span className="font-bold text-slate-900">{opt.feasibilityScore}/10</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${(opt.feasibilityScore / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
