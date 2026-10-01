import React, { useState } from 'react';
import { DecisionInput } from '../types/decision';
import { ALL_MODELS } from '../data/modelsData';
import { Plus, X, Layers, Sparkles, Send, Clock, Users, Zap } from 'lucide-react';

interface DecisionInputFormProps {
  onSubmit: (input: DecisionInput) => void;
  selectedModelIds: string[];
  onOpenModelSelector: () => void;
  onAutoSuggest: (context?: { title: string; description: string; options: string[] }) => void;
  isLoading: boolean;
  isSuggesting: boolean;
}

export const DecisionInputForm: React.FC<DecisionInputFormProps> = ({
  onSubmit,
  selectedModelIds,
  onOpenModelSelector,
  onAutoSuggest,
  isLoading,
  isSuggesting,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [stakeholders, setStakeholders] = useState('');
  const [timeframe, setTimeframe] = useState('');

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleTriggerAutoSuggest = () => {
    const cleanedOptions = options.map(o => o.trim()).filter(o => o.length > 0);
    onAutoSuggest({
      title: title.trim(),
      description: description.trim(),
      options: cleanedOptions
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !description.trim()) {
      return;
    }

    const cleanedOptions = options.map(o => o.trim()).filter(o => o.length > 0);

    onSubmit({
      title: title.trim() || 'Strategic Decision Evaluation',
      description: description.trim(),
      options: cleanedOptions,
      selectedModelIds: selectedModelIds,
      urgencyLevel,
      stakeholders: stakeholders.trim(),
      timeframe: timeframe.trim()
    });
  };

  const setSampleDilemma = (type: 'career' | 'startup' | 'lifestyle') => {
    let newTitle = '';
    let newDesc = '';
    let newOpts: string[] = [];

    if (type === 'career') {
      newTitle = 'Accept VP of Engineering at Scale-Up vs Stay at Big Tech for Executive Track';
      newDesc = 'Torn between joining a series-B startup with high growth potential but risk, versus staying at my current company with guaranteed stability and a clear path to VP in 2 years.';
      newOpts = ['Option A: Join Series-B Scale-Up', 'Option B: Stay at Big Tech Company'];
      setUrgencyLevel('high');
      setStakeholders('Family, Career Mentors');
      setTimeframe('Next 2 Weeks');
    } else if (type === 'startup') {
      newTitle = 'Launch Freemium Self-Serve Model vs Focus Exclusively on B2B Enterprise';
      newDesc = 'Our engineering team wants to launch a freemium tier to capture developer market share, but sales fears it will dilute our premium enterprise contract deals ($50k ARR average).';
      newOpts = ['Option A: Launch Freemium Tier', 'Option B: Double down on Enterprise Sales'];
      setUrgencyLevel('medium');
      setStakeholders('Board, Co-Founders, Sales Team');
      setTimeframe('Q3 Launch');
    } else if (type === 'lifestyle') {
      newTitle = 'Relocate to European Tech Hub vs Stay in Home Country & Work Remotely';
      newDesc = 'Evaluated an offer that requires relocating to Berlin. Great cultural experience and new network, but involves leaving local support system and dealing with tax complexities.';
      newOpts = ['Option A: Relocate to Berlin', 'Option B: Remain Remote in Current Location'];
      setUrgencyLevel('medium');
      setStakeholders('Partner, Relocation Team');
      setTimeframe('Next 3 Months');
    }

    setTitle(newTitle);
    setDescription(newDesc);
    setOptions(newOpts);

    // Auto-match frameworks immediately for preset sample
    onAutoSuggest({ title: newTitle, description: newDesc, options: newOpts });
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="font-serif font-bold text-2xl text-slate-900 tracking-tight">
            Frame Your Decision
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            State your dilemma and options. We will apply strategic decision frameworks to break the tie.
          </p>
        </div>

        {/* Preset Sample Triggers */}
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-slate-400 text-[11px] font-medium hidden lg:inline">Try Preset:</span>
          <button
            type="button"
            onClick={() => setSampleDilemma('career')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium transition-colors"
          >
            Career Move
          </button>
          <button
            type="button"
            onClick={() => setSampleDilemma('startup')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium transition-colors"
          >
            Startup Strategy
          </button>
          <button
            type="button"
            onClick={() => setSampleDilemma('lifestyle')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium transition-colors"
          >
            Relocation
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Decision Title / Core Question <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Should I launch a freemium model or remain strictly enterprise B2B?"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-serif"
          />
        </div>

        {/* Detailed Dilemma Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Dilemma Context & Key Factors
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide relevant background context, constraints, risks, financial stakes, or personal feelings..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        {/* Options Under Consideration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Options Being Evaluated
            </label>
            <span className="text-[11px] text-slate-500">Add up to 5 options</span>
          </div>

          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + idx)} description (e.g. ${
                    idx === 0 ? 'Accept Job Offer A' : 'Stay at Current Role B'
                  })`}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                />
                {options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 5 && (
            <button
              type="button"
              onClick={addOption}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 text-slate-600 text-xs font-medium transition-colors mt-1"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Add Another Option</span>
            </button>
          )}
        </div>

        {/* Metadata Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center space-x-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Urgency Level</span>
            </label>
            <select
              value={urgencyLevel}
              onChange={(e) => setUrgencyLevel(e.target.value as any)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
            >
              <option value="low">Low (Strategic Horizon)</option>
              <option value="medium">Medium (Next Few Weeks)</option>
              <option value="high">High (Urgent Deadline)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center space-x-1">
              <Users className="w-3 h-3 text-indigo-500" />
              <span>Key Stakeholders</span>
            </label>
            <input
              type="text"
              value={stakeholders}
              onChange={(e) => setStakeholders(e.target.value)}
              placeholder="e.g., Board, Family, Team"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center space-x-1">
              <Clock className="w-3 h-3 text-emerald-500" />
              <span>Time Horizon</span>
            </label>
            <input
              type="text"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              placeholder="e.g., Q3, 6 Months, Immediate"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Strategic Framework Selection Section */}
        <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span className="font-serif font-bold text-sm text-white">
                Selected Strategic Frameworks ({selectedModelIds.length}/3)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleTriggerAutoSuggest}
                disabled={isSuggesting}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isSuggesting ? 'Matching Dilemma...' : '✨ AI Auto-Match Models'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenModelSelector}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 transition-colors"
              >
                Change Selection
              </button>
            </div>
          </div>

          {/* Selected Model Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {selectedModelIds.map((id) => {
              const model = ALL_MODELS.find(m => m.id === id);
              return (
                <div
                  key={id}
                  className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 flex flex-col justify-between space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-300">{model?.name || id}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{model?.categoryName}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 italic line-clamp-2">
                    "{model?.strategicQuestion}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || (!title.trim() && !description.trim())}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing Decision Frameworks...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Run Strategic Tiebreaker Analysis</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
