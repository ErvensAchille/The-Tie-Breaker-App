import React, { useState } from 'react';
import { SavedDecision, DecisionAnalysisResult } from '../types/decision';
import { Clock, CheckCircle2, AlertCircle, Trash2, Edit3, Eye, ArrowRight, Bookmark, Sparkles } from 'lucide-react';

interface DecisionHistoryProps {
  savedDecisions: SavedDecision[];
  onSelectDecision: (result: DecisionAnalysisResult) => void;
  onUpdateDecision: (updated: SavedDecision) => void;
  onDeleteDecision: (id: string) => void;
  onNewDecision: () => void;
}

export const DecisionHistory: React.FC<DecisionHistoryProps> = ({
  savedDecisions,
  onSelectDecision,
  onUpdateDecision,
  onDeleteDecision,
  onNewDecision,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingDecision, setEditingDecision] = useState<SavedDecision | null>(null);

  const filtered = savedDecisions.filter(d =>
    filterStatus === 'all' ? true : d.status === filterStatus
  );

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDecision) {
      onUpdateDecision(editingDecision);
      setEditingDecision(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              Personal Decision Audit Trail
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              Decision Logs & Outcome Tracker
            </h1>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Track choices made over time, record actual outcomes, and continuously refine your strategic intuition against real-world performance.
        </p>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 pt-2 text-xs">
          {['all', 'Pending', 'In Progress', 'Decided', 'Archived'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-colors ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Decision List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200/90 rounded-2xl space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-serif font-bold text-slate-900 text-lg">No Saved Decisions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Run an analysis in the Workbench and click "Save to Log" to track choices, record actual real-world outcomes, and measure execution confidence.
          </p>
          <button
            onClick={onNewDecision}
            className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Formulate First Decision</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(decision => (
            <div
              key={decision.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all flex flex-col md:flex-row justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                    decision.status === 'Decided'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                      : decision.status === 'In Progress'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                      : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                  }`}>
                    {decision.status}
                  </span>

                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(decision.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-xl text-slate-900">
                  {decision.title}
                </h3>

                {decision.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {decision.description}
                  </p>
                )}

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/80 text-xs space-y-1">
                  <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                    Executive Verdict Recommendation:
                  </span>
                  <p className="text-indigo-900 font-semibold font-serif text-sm">
                    {decision.result.analyses?.[0]?.verdict?.recommendedOption || 'Recommended Option'}
                  </p>
                </div>

                {decision.outcomeNotes && (
                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                    <span className="font-bold text-indigo-900 block text-[10px] uppercase tracking-wider">
                      Recorded Real-World Outcome Notes:
                    </span>
                    <p className="italic">{decision.outcomeNotes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col items-center justify-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                <button
                  onClick={() => onSelectDecision(decision.result)}
                  className="flex-1 md:flex-none w-full px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Full Brief</span>
                </button>

                <button
                  onClick={() => setEditingDecision(decision)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Log</span>
                </button>

                <button
                  onClick={() => onDeleteDecision(decision.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete from log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Edit Log Modal */}
      {editingDecision && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveEdit} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif font-bold text-xl text-slate-900">
              Update Decision Log Entry
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Execution Status
              </label>
              <select
                value={editingDecision.status}
                onChange={(e) => setEditingDecision({ ...editingDecision, status: e.target.value as any })}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs text-slate-900"
              >
                <option value="Pending">Pending (Under Consideration)</option>
                <option value="In Progress">In Progress (Executing Choice)</option>
                <option value="Decided">Decided (Choice Finalized)</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Chosen Option
              </label>
              <input
                type="text"
                value={editingDecision.chosenOption || ''}
                onChange={(e) => setEditingDecision({ ...editingDecision, chosenOption: e.target.value })}
                placeholder="e.g., Option A: Launch Freemium Tier"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Real-World Outcome Notes & Retrospective
              </label>
              <textarea
                rows={3}
                value={editingDecision.outcomeNotes || ''}
                onChange={(e) => setEditingDecision({ ...editingDecision, outcomeNotes: e.target.value })}
                placeholder="What actually happened after executing this decision? Record revenue impact, personal satisfaction, or lessons learned..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingDecision(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
