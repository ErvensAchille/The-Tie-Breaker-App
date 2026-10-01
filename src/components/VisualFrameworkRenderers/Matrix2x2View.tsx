import React from 'react';
import { FrameworkData } from '../../types/decision';
import { CheckCircle2 } from 'lucide-react';

interface Matrix2x2ViewProps {
  frameworkData: FrameworkData;
}

export const Matrix2x2View: React.FC<Matrix2x2ViewProps> = ({ frameworkData }) => {
  const matrix = frameworkData.matrix;

  if (!matrix || !matrix.quadrants) {
    return (
      <div className="p-4 rounded-xl bg-slate-100 text-slate-600 text-sm italic">
        Matrix data is rendering in fallback view.
      </div>
    );
  }

  const { topLeft, topRight, bottomLeft, bottomRight } = matrix.quadrants;

  return (
    <div className="space-y-4">
      {/* Axis Headers */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-2 uppercase tracking-wider">
        <div className="flex items-center space-x-1">
          <span>Y-Axis:</span>
          <span className="text-slate-900 bg-slate-200/80 px-2 py-0.5 rounded-md">{matrix.yAxis || 'Vertical Factor'}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>X-Axis:</span>
          <span className="text-slate-900 bg-slate-200/80 px-2 py-0.5 rounded-md">{matrix.xAxis || 'Horizontal Factor'}</span>
        </div>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Left Quadrant */}
        <div className="p-4 rounded-xl border border-slate-200/90 bg-amber-50/50 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                  Quadrant I (Top-Left)
                </span>
                <h4 className="font-serif font-bold text-slate-900 mt-1 text-base">{topLeft?.title || 'Top Left'}</h4>
                {topLeft?.subtitle && (
                  <p className="text-xs text-slate-600 italic mt-0.5">{topLeft.subtitle}</p>
                )}
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-800">
              {topLeft?.items?.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Top Right Quadrant (Priority / Target Zone) */}
        <div className="p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 bg-indigo-200/80 px-2 py-0.5 rounded-md">
                  Quadrant II (Top-Right / Focus Zone)
                </span>
                <h4 className="font-serif font-bold text-slate-900 mt-1 text-base">{topRight?.title || 'Top Right'}</h4>
                {topRight?.subtitle && (
                  <p className="text-xs text-slate-600 italic mt-0.5">{topRight.subtitle}</p>
                )}
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-900">
              {topRight?.items?.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Left Quadrant */}
        <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-100/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-md">
                  Quadrant III (Bottom-Left)
                </span>
                <h4 className="font-serif font-bold text-slate-900 mt-1 text-base">{bottomLeft?.title || 'Bottom Left'}</h4>
                {bottomLeft?.subtitle && (
                  <p className="text-xs text-slate-500 italic mt-0.5">{bottomLeft.subtitle}</p>
                )}
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-700">
              {bottomLeft?.items?.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Right Quadrant */}
        <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-md">
                  Quadrant IV (Bottom-Right)
                </span>
                <h4 className="font-serif font-bold text-slate-900 mt-1 text-base">{bottomRight?.title || 'Bottom Right'}</h4>
                {bottomRight?.subtitle && (
                  <p className="text-xs text-slate-600 italic mt-0.5">{bottomRight.subtitle}</p>
                )}
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-800">
              {bottomRight?.items?.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
