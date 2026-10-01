import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DecisionInputForm } from './components/DecisionInputForm';
import { AnalysisResults } from './components/AnalysisResults';
import { ModelSelectorModal } from './components/ModelSelectorModal';
import { ModelExplorer } from './components/ModelExplorer';
import { DecisionHistory } from './components/DecisionHistory';
import { VoiceAssistant } from './components/VoiceAssistant';
import { DecisionInput, DecisionAnalysisResult, SavedDecision } from './types/decision';
import { AlertCircle, Compass } from 'lucide-react';
import { generateClientFallbackRecommendations, generateClientFallbackAnalysis } from './utils/fallbackAnalyzer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workbench' | 'explorer' | 'history'>('workbench');
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([
    'eisenhower-matrix',
    'swot-analysis',
    'rubber-band-model'
  ]);
  const [analysisResult, setAnalysisResult] = useState<DecisionAnalysisResult | null>(null);
  const [savedDecisions, setSavedDecisions] = useState<SavedDecision[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInputContext, setLastInputContext] = useState<{ title: string; description: string; options: string[] }>({
    title: '',
    description: '',
    options: []
  });

  // Load saved decisions from localStorage on startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem('the_tiebreaker_decisions');
      if (stored) {
        setSavedDecisions(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse saved decisions from localStorage:', e);
    }
  }, []);

  // Sync saved decisions to localStorage
  const saveDecisionsToStorage = (updated: SavedDecision[]) => {
    setSavedDecisions(updated);
    try {
      localStorage.setItem('the_tiebreaker_decisions', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to write saved decisions to localStorage:', e);
    }
  };

  const [hasCustomizedModels, setHasCustomizedModels] = useState(false);

  // AI Model Auto-Matcher with Resilient Fallback
  const handleAutoSuggestModels = async (context?: { title?: string; description?: string; options?: string[] }) => {
    try {
      setIsSuggesting(true);
      setError(null);

      const targetCtx = {
        title: context?.title !== undefined ? context.title : lastInputContext.title,
        description: context?.description !== undefined ? context.description : lastInputContext.description,
        options: context?.options !== undefined ? context.options : lastInputContext.options
      };

      setLastInputContext(targetCtx);

      let data: any = null;
      try {
        const response = await fetch('/api/recommend-models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetCtx),
        });

        if (response.ok) {
          data = await response.json();
        }
      } catch (netErr) {
        console.warn('Network call to /api/recommend-models failed, using resilient fallback:', netErr);
      }

      if (data && data.recommendations && data.recommendations.length > 0) {
        const newIds = data.recommendations.map((r: any) => r.modelId).filter(Boolean);
        if (newIds.length > 0) {
          setSelectedModelIds(newIds.slice(0, 3));
          setHasCustomizedModels(true);
          return newIds.slice(0, 3);
        }
      }

      // Fallback smart recommendation
      const fallbackRecs = generateClientFallbackRecommendations(targetCtx.title, targetCtx.description);
      const fallbackIds = fallbackRecs.map(r => r.modelId);
      if (fallbackIds.length > 0) {
        setSelectedModelIds(fallbackIds.slice(0, 3));
        setHasCustomizedModels(true);
        return fallbackIds.slice(0, 3);
      }
    } catch (err: any) {
      console.error('Error auto-suggesting models:', err);
      const fallbackRecs = generateClientFallbackRecommendations(lastInputContext.title, lastInputContext.description);
      const fallbackIds = fallbackRecs.map(r => r.modelId).slice(0, 3);
      setSelectedModelIds(fallbackIds);
      setHasCustomizedModels(true);
      return fallbackIds;
    } finally {
      setIsSuggesting(false);
    }
  };

  // Run Strategic Analysis with Resilient Fallback
  const handleAnalyzeDecision = async (input: DecisionInput) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentCtx = {
        title: input.title,
        description: input.description,
        options: input.options
      };
      setLastInputContext(currentCtx);

      let effectiveModelIds = input.selectedModelIds && input.selectedModelIds.length > 0
        ? input.selectedModelIds
        : selectedModelIds;

      // Check if models need dynamic auto-selection for this specific dilemma
      const isInitialDefault = effectiveModelIds.length === 3 &&
        effectiveModelIds.includes('eisenhower-matrix') &&
        effectiveModelIds.includes('swot-analysis') &&
        effectiveModelIds.includes('rubber-band-model');

      if (!hasCustomizedModels || isInitialDefault) {
        // Automatically fetch tailored models for this specific question
        const freshModels = await handleAutoSuggestModels(currentCtx);
        if (freshModels && freshModels.length > 0) {
          effectiveModelIds = freshModels;
        } else {
          const fallbackRecs = generateClientFallbackRecommendations(input.title, input.description);
          effectiveModelIds = fallbackRecs.map(r => r.modelId).slice(0, 3);
          setSelectedModelIds(effectiveModelIds);
        }
      }

      const inputWithTailoredModels: DecisionInput = {
        ...input,
        selectedModelIds: effectiveModelIds
      };

      let resultData: DecisionAnalysisResult | null = null;

      try {
        const response = await fetch('/api/analyze-decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inputWithTailoredModels),
        });

        if (response.ok) {
          resultData = await response.json();
        }
      } catch (netErr) {
        console.warn('Network call to /api/analyze-decision failed, using resilient fallback:', netErr);
      }

      if (!resultData) {
        // Fallback analysis generator
        resultData = generateClientFallbackAnalysis(inputWithTailoredModels);
      }

      setAnalysisResult(resultData);
    } catch (err: any) {
      console.error('Error running decision analysis:', err);
      const fallbackData = generateClientFallbackAnalysis(input);
      setAnalysisResult(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  // Save active analysis result to decision log
  const handleSaveToHistory = (resultToSave: DecisionAnalysisResult) => {
    const existingIdx = savedDecisions.findIndex(d => d.result.id === resultToSave.id);
    if (existingIdx >= 0) return;

    const newRecord: SavedDecision = {
      id: resultToSave.id,
      createdAt: resultToSave.createdAt,
      title: resultToSave.decisionTitle,
      description: resultToSave.decisionDescription,
      options: resultToSave.options,
      status: 'Pending',
      result: resultToSave
    };

    saveDecisionsToStorage([newRecord, ...savedDecisions]);
  };

  const handleUpdateSavedDecision = (updated: SavedDecision) => {
    const nextList = savedDecisions.map(d => d.id === updated.id ? updated : d);
    saveDecisionsToStorage(nextList);
  };

  const handleDeleteSavedDecision = (id: string) => {
    const nextList = savedDecisions.filter(d => d.id !== id);
    saveDecisionsToStorage(nextList);
  };

  const handleSelectModelForWorkbench = (modelId: string) => {
    if (!selectedModelIds.includes(modelId)) {
      setSelectedModelIds([modelId, ...selectedModelIds.slice(0, 2)]);
    }
    setHasCustomizedModels(true);
    setActiveTab('workbench');
  };

  const handleNewDecision = () => {
    setAnalysisResult(null);
    setError(null);
    setActiveTab('workbench');
  };

  const isCurrentResultSaved = Boolean(
    analysisResult && savedDecisions.some(d => d.result.id === analysisResult.id)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewDecision={handleNewDecision}
        savedCount={savedDecisions.length}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Notification Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start space-x-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-xs sm:text-sm">
              <span className="font-bold block">Analysis Error</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-600 hover:text-rose-800 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* WORKBENCH VIEW */}
        {activeTab === 'workbench' && (
          <div className="space-y-8">
            {analysisResult ? (
              <AnalysisResults
                result={analysisResult}
                onSaveToHistory={handleSaveToHistory}
                onNewDecision={handleNewDecision}
                isSaved={isCurrentResultSaved}
              />
            ) : (
              <DecisionInputForm
                onSubmit={handleAnalyzeDecision}
                selectedModelIds={selectedModelIds}
                onOpenModelSelector={() => setIsModelSelectorOpen(true)}
                onAutoSuggest={handleAutoSuggestModels}
                isLoading={isLoading}
                isSuggesting={isSuggesting}
              />
            )}
          </div>
        )}

        {/* CATALOG / EXPLORER VIEW */}
        {activeTab === 'explorer' && (
          <ModelExplorer
            onSelectModelForWorkbench={handleSelectModelForWorkbench}
          />
        )}

        {/* HISTORY / DECISION LOG VIEW */}
        {activeTab === 'history' && (
          <DecisionHistory
            savedDecisions={savedDecisions}
            onSelectDecision={(res) => {
              setAnalysisResult(res);
              setActiveTab('workbench');
            }}
            onUpdateDecision={handleUpdateSavedDecision}
            onDeleteDecision={handleDeleteSavedDecision}
            onNewDecision={handleNewDecision}
          />
        )}

      </main>

      {/* Model Picker Selector Modal */}
      <ModelSelectorModal
        isOpen={isModelSelectorOpen}
        onClose={() => setIsModelSelectorOpen(false)}
        selectedModelIds={selectedModelIds}
        onSelectModelIds={(ids) => {
          setSelectedModelIds(ids);
          setHasCustomizedModels(true);
        }}
        onAutoSuggest={handleAutoSuggestModels}
        isSuggesting={isSuggesting}
      />

      {/* Stark Tech JARVIS/FRIDAY Voice Assistant */}
      <VoiceAssistant
        currentResult={analysisResult}
        onAnalyzeDecision={(input) => {
          handleAnalyzeDecision({
            title: input.title,
            description: input.description,
            options: input.options,
            selectedModelIds: input.selectedModelIds,
          });
        }}
        onNavigateTab={setActiveTab}
        onNewDecision={handleNewDecision}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span className="font-serif font-bold text-white">The Tiebreaker</span>
            <span>— Strategic Decision Engine</span>
          </div>
          <p className="text-center sm:text-right text-slate-500">
            Powered by 50 models from Krogerus & Tschäppeler’s <em>The Decision Book</em> + 2 Strategic Innovation Frameworks.
          </p>
        </div>
      </footer>

    </div>
  );
}
