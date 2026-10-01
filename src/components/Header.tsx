import React from 'react';
import { Compass, BookOpen, Clock, PlusCircle, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'workbench' | 'explorer' | 'history';
  setActiveTab: (tab: 'workbench' | 'explorer' | 'history') => void;
  onNewDecision: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onNewDecision,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setActiveTab('workbench')}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs group-hover:bg-indigo-700 transition-colors">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-xl font-bold tracking-tight text-slate-900">
                  The Tiebreaker
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  52 Models
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Strategic Decision Engine & Choice Framer
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              onClick={() => setActiveTab('workbench')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'workbench'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${activeTab === 'workbench' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>Workbench</span>
            </button>

            <button
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'explorer'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${activeTab === 'explorer' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>52 Models Catalog</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Clock className={`w-4 h-4 ${activeTab === 'history' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>Decision Log</span>
              {savedCount > 0 && (
                <span className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'history' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {savedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Action */}
          <div className="hidden md:flex items-center">
            <button
              onClick={onNewDecision}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Decision</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
