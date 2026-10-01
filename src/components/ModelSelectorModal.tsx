import React, { useState } from 'react';
import { ALL_MODELS, CATEGORIES, searchModels } from '../data/modelsData';
import { StrategicModel } from '../types/decision';
import { Search, Check, Sparkles, X, Info, Layers } from 'lucide-react';

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModelIds: string[];
  onSelectModelIds: (ids: string[]) => void;
  onAutoSuggest: () => void;
  isSuggesting?: boolean;
}

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedModelIds,
  onSelectModelIds,
  onAutoSuggest,
  isSuggesting = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredModel, setHoveredModel] = useState<StrategicModel | null>(null);

  if (!isOpen) return null;

  const filteredModels = searchModels(searchQuery).filter(m =>
    activeCategory === 'all' ? true : m.category === activeCategory
  );

  const toggleModel = (id: string) => {
    if (selectedModelIds.includes(id)) {
      onSelectModelIds(selectedModelIds.filter(mId => mId !== id));
    } else {
      if (selectedModelIds.length >= 3) {
        // Replace oldest or keep max 3
        onSelectModelIds([...selectedModelIds.slice(1), id]);
      } else {
        onSelectModelIds([...selectedModelIds, id]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
                Select Strategic Frameworks (Up to 3)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pick models from Krogerus & Tschäppeler’s 50 models or the 2 Strategic Disruption models.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onAutoSuggest}
              disabled={isSuggesting}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSuggesting ? 'Analyzing Dilemma...' : 'AI Auto-Match'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Currently Selected Badges Bar */}
        <div className="px-6 py-3 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Active Selection ({selectedModelIds.length}/3):</span>
          {selectedModelIds.map(id => {
            const m = ALL_MODELS.find(item => item.id === id);
            return (
              <span
                key={id}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-900/80 text-indigo-200 border border-indigo-700 font-semibold"
              >
                <span>{m?.name || id}</span>
                <button
                  onClick={() => toggleModel(id)}
                  className="hover:text-rose-400 transition-colors ml-1 font-bold"
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>

        {/* Filter Controls */}
        <div className="px-6 py-3 border-b border-slate-800 space-y-2 bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name or keywords..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto text-[11px]">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
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

        {/* Models Grid & Quick Info Sidebar */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Models Grid (2 Cols) */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2">
            {filteredModels.map(model => {
              const isSelected = selectedModelIds.includes(model.id);
              return (
                <div
                  key={model.id}
                  onClick={() => toggleModel(model.id)}
                  onMouseEnter={() => setHoveredModel(model)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-xs'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-serif font-bold text-sm text-white">
                        {model.name}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {model.tagline}
                    </p>
                  </div>

                  <span className="text-[10px] text-indigo-300 font-medium mt-2 block">
                    {model.categoryName}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Hover Preview Sidebar (1 Col) */}
          <div className="hidden md:block p-4 rounded-xl bg-slate-800 border border-slate-700 text-xs space-y-3">
            {hoveredModel ? (
              <>
                <div className="flex items-center space-x-1 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5" />
                  <span>Model Overview</span>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-base text-white">
                    {hoveredModel.name}
                  </h4>
                  <p className="text-[11px] text-indigo-300 mt-0.5">
                    Category: {hoveredModel.categoryName}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-750 text-slate-200 italic font-serif text-xs">
                  "{hoveredModel.strategicQuestion}"
                </div>

                <div>
                  <span className="font-semibold text-slate-300 block mb-1">
                    When to apply:
                  </span>
                  <ul className="space-y-1 text-slate-400 text-[11px]">
                    {hoveredModel.whenToUse.slice(0, 3).map((use, i) => (
                      <li key={i} className="flex items-start space-x-1">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{use}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2 py-8">
                <Info className="w-8 h-8 text-slate-600" />
                <p>Hover over any model to preview its central question and applications.</p>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Selected: <strong className="text-indigo-400">{selectedModelIds.length}</strong> / 3 frameworks
          </span>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            Apply Frameworks to Workbench
          </button>
        </div>

      </div>
    </div>
  );
};
