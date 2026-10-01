import React, { useState } from 'react';
import { ALL_MODELS, CATEGORIES, searchModels } from '../data/modelsData';
import { StrategicModel } from '../types/decision';
import { Search, BookOpen, ArrowRight, Sparkles } from 'lucide-react';

interface ModelExplorerProps {
  onSelectModelForWorkbench: (modelId: string) => void;
}

export const ModelExplorer: React.FC<ModelExplorerProps> = ({ onSelectModelForWorkbench }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<StrategicModel | null>(null);

  const filteredModels = searchModels(searchQuery).filter(m =>
    activeCategory === 'all' ? true : m.category === activeCategory
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              Complete Reference Library
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              52 Strategic Decision Models
            </h1>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Featuring all 50 strategic thinking models from Mikael Krogerus and Roman Tschäppeler’s <em>The Decision Book</em>, plus 2 custom macroeconomic disruption frameworks: <strong>The Creative Destruction Model</strong> and <strong>The Disruptive Innovation Model</strong>.
        </p>

        {/* Search & Category Filter Bar */}
        <div className="pt-2 space-y-3">
          <div className="relative max-w-2xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 52 models by name, dilemma, or question (e.g., Eisenhower Matrix, GROW, SCAMPER)..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Models */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map(model => (
          <div
            key={model.id}
            className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-indigo-300 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                  {model.categoryName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  #{model.id}
                </span>
              </div>

              <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                {model.name}
              </h3>

              <p className="text-xs font-medium text-slate-600 mt-1 line-clamp-2">
                {model.tagline}
              </p>

              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 italic">
                "{model.strategicQuestion}"
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedModel(model)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                View Full Details
              </button>

              <button
                onClick={() => onSelectModelForWorkbench(model.id)}
                className="flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span>Apply in Workbench</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Model Detail Modal */}
      {selectedModel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                  {selectedModel.categoryName}
                </span>
                <h2 className="font-serif font-bold text-2xl text-slate-900 mt-2">
                  {selectedModel.name}
                </h2>
                <p className="text-xs text-slate-500 font-medium">{selectedModel.tagline}</p>
              </div>
              <button
                onClick={() => setSelectedModel(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                  Central Strategic Question
                </span>
                <p className="font-serif text-base italic text-indigo-100">
                  "{selectedModel.strategicQuestion}"
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1 text-xs uppercase tracking-wider">
                  Model Description & Methodology
                </h4>
                <p className="leading-relaxed text-slate-600">{selectedModel.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1 text-xs uppercase tracking-wider">
                  When to Apply This Model
                </h4>
                <ul className="space-y-1 text-slate-600">
                  {selectedModel.whenToUse.map((use, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{use}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-indigo-950">
                <span className="font-bold block text-xs uppercase tracking-wider mb-1 text-indigo-800">
                  Example Real-World Dilemma
                </span>
                <p className="italic text-xs text-indigo-900">{selectedModel.exampleDilemma}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedModel(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>

              <button
                onClick={() => {
                  onSelectModelForWorkbench(selectedModel.id);
                  setSelectedModel(null);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Select for Decision Workbench</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
