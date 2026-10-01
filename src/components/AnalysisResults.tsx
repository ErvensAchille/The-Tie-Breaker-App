import React, { useState } from 'react';
import { DecisionAnalysisResult, SingleModelAnalysis } from '../types/decision';
import { Matrix2x2View } from './VisualFrameworkRenderers/Matrix2x2View';
import { ProsConsScorecard } from './VisualFrameworkRenderers/ProsConsScorecard';
import { StepsFrameworkView } from './VisualFrameworkRenderers/StepsFrameworkView';
import { CurveStageView } from './VisualFrameworkRenderers/CurveStageView';
import { SCAMPERView } from './VisualFrameworkRenderers/SCAMPERView';
import { PyramidView } from './VisualFrameworkRenderers/PyramidView';
import {
  Compass,
  AlertTriangle,
  BookmarkPlus,
  Copy,
  Download,
  HelpCircle,
  ListOrdered,
  Layers,
  ArrowLeft,
  Sparkles,
  Award
} from 'lucide-react';

interface AnalysisResultsProps {
  result: DecisionAnalysisResult;
  onSaveToHistory: (result: DecisionAnalysisResult) => void;
  onNewDecision: () => void;
  isSaved?: boolean;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  result,
  onSaveToHistory,
  onNewDecision,
  isSaved = false,
}) => {
  const [activeModelIndex, setActiveModelIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeAnalysis: SingleModelAnalysis = result.analyses[activeModelIndex] || result.analyses[0];

  const handleCopyMemo = () => {
    const memoText = `
# THE TIEBREAKER EXECUTIVE DECISION BRIEF

**Decision Title:** ${result.decisionTitle}
**Dilemma:** ${result.decisionDescription}

---

## MASTER TIEBREAKER SYNTHESIS
${result.overallTiebreakerSummary}

---

## MODEL ANALYSIS: ${activeAnalysis?.modelName} (${activeAnalysis?.categoryName})
*Strategic Question:* ${activeAnalysis?.strategicQuestion}

**Model Summary:** ${activeAnalysis?.modelSummary}

**Verdict:** ${activeAnalysis?.verdict?.recommendedOption} (Confidence: ${activeAnalysis?.verdict?.confidenceScore}%)
**Rationale:** ${activeAnalysis?.verdict?.executiveRationale}

**Key Trade-offs:**
${activeAnalysis?.verdict?.keyTradeOffs?.map(t => `- ${t}`).join('\n')}

**Blind Spots to Watch:**
${activeAnalysis?.verdict?.blindSpotsToWatch?.map(b => `- ${b}`).join('\n')}

**Immediate Action Plan:**
${activeAnalysis?.actionPlan?.map((a, i) => `${i+1}. ${a}`).join('\n')}

---
Generated via The Tiebreaker Decision Engine (52 Strategic Models)
`;

    navigator.clipboard.writeText(memoText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    const markdownContent = `
# The Tiebreaker Decision Brief: ${result.decisionTitle}

**Date:** ${new Date(result.createdAt).toLocaleDateString()}
**Dilemma:** ${result.decisionDescription}

## Master Executive Summary
${result.overallTiebreakerSummary}

${result.analyses.map((a, i) => `
---
### Framework ${i+1}: ${a.modelName} (${a.categoryName})
*${a.strategicQuestion}*

**Summary:** ${a.modelSummary}

#### Verdict & Recommendation
- **Recommended Path:** ${a.verdict.recommendedOption}
- **Confidence Rating:** ${a.verdict.confidenceScore}%
- **Executive Rationale:** ${a.verdict.executiveRationale}

#### Trade-offs & Risks
${a.verdict.keyTradeOffs.map(t => `- Trade-off: ${t}`).join('\n')}
${a.verdict.blindSpotsToWatch.map(b => `- Blind spot: ${b}`).join('\n')}

#### Action Plan
${a.actionPlan.map((step, idx) => `${idx+1}. ${step}`).join('\n')}

#### Reflection Questions
${a.reflectionQuestions.map(q => `- ${q}`).join('\n')}
`).join('\n')}
`;

    const blob = new Blob([markdownContent.trim()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tiebreaker_Brief_${result.decisionTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderVisualFramework = (analysis: SingleModelAnalysis) => {
    const vType = analysis.visualType;
    const fData = analysis.frameworkData;

    if (vType === 'matrix2x2' || fData.matrix) {
      return <Matrix2x2View frameworkData={fData} />;
    }
    if (vType === 'prosCons' || fData.optionsComparison) {
      return <ProsConsScorecard frameworkData={fData} />;
    }
    if (vType === 'steps' || fData.steps) {
      return <StepsFrameworkView frameworkData={fData} />;
    }
    if (vType === 'curve' || fData.curve) {
      return <CurveStageView frameworkData={fData} />;
    }
    if (vType === 'scamper' || fData.scamper) {
      return <SCAMPERView frameworkData={fData} />;
    }
    if (vType === 'pyramid' || fData.pyramidLevels) {
      return <PyramidView frameworkData={fData} />;
    }

    return <ProsConsScorecard frameworkData={fData} />;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <button
          onClick={onNewDecision}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Formulate Another Decision</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSaveToHistory(result)}
            disabled={isSaved}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all ${
              isSaved
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved to Decision Log' : 'Save to Log'}</span>
          </button>

          <button
            onClick={handleCopyMemo}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold border border-slate-200/80 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-slate-600" />
            <span>{copied ? 'Copied Brief!' : 'Copy Executive Memo'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold border border-slate-200/80 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Markdown</span>
          </button>
        </div>
      </div>

      {/* MASTER EXECUTIVE TIEBREAKER VERDICT BANNER */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Award className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="flex items-center space-x-3">
          <span className="p-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-xs">
            <Compass className="w-5 h-5 text-white" />
          </span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              Executive Decision Brief & Master Recommendation
            </span>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-white">
              {result.decisionTitle}
            </h1>
          </div>
        </div>

        {/* Synthesis Text */}
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs sm:text-sm leading-relaxed">
          <p className="font-semibold text-indigo-300 mb-1 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Synthesis Across Strategic Models:</span>
          </p>
          <p className="whitespace-pre-line font-medium text-slate-100">{result.overallTiebreakerSummary}</p>
        </div>

        {/* Active Model Verdict Card */}
        {activeAnalysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            
            {/* Recommended Option & Confidence */}
            <div className="lg:col-span-1 p-5 rounded-xl bg-indigo-950/90 border border-indigo-800 space-y-3 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  The Tiebreaker Verdict
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-900 text-indigo-200 border border-indigo-700">
                  {activeAnalysis.verdict.confidenceScore}% Confidence
                </span>
              </div>

              <h3 className="font-serif font-bold text-white text-lg sm:text-xl">
                {activeAnalysis.verdict.recommendedOption}
              </h3>

              <p className="text-xs text-indigo-100 leading-relaxed">
                {activeAnalysis.verdict.executiveRationale}
              </p>
            </div>

            {/* Key Trade-Offs & Blind Spots */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Trade-Offs */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Key Strategic Trade-Offs</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activeAnalysis.verdict.keyTradeOffs?.map((trade, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{trade}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Blind Spots */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center space-x-1.5 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Blind Spots & Assumptions</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activeAnalysis.verdict.blindSpotsToWatch?.map((spot, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{spot}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* MODEL FRAMEWORK SELECTOR TABS */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2 flex-shrink-0">
            Framework Lenses:
          </span>
          {result.analyses.map((analysis, idx) => (
            <button
              key={idx}
              onClick={() => setActiveModelIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 ${
                activeModelIndex === idx
                  ? 'bg-slate-900 text-indigo-300 shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{analysis.modelName}</span>
              <span className="text-[10px] opacity-75 font-normal">({analysis.categoryName})</span>
            </button>
          ))}
        </div>

        {/* ACTIVE MODEL DETAILS CONTAINER */}
        {activeAnalysis && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
            
            {/* Model Header */}
            <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200/60">
                  {activeAnalysis.categoryName}
                </span>
                <h3 className="font-serif font-bold text-2xl text-slate-900 mt-2">
                  {activeAnalysis.modelName}
                </h3>
                <p className="text-xs text-slate-600 italic mt-1">
                  Strategic Question: "{activeAnalysis.strategicQuestion}"
                </p>
              </div>

              <div className="text-xs text-slate-600 max-w-sm bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                {activeAnalysis.modelSummary}
              </div>
            </div>

            {/* WHY THIS MENTAL MODEL WAS CHOSEN FOR YOUR DECISION */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/90 via-slate-50 to-amber-50/60 border border-indigo-200/90 space-y-1.5 shadow-2xs">
              <div className="flex items-center space-x-2 text-indigo-950 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Why This Mental Model Was Selected For Your Decision</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed pl-6 font-medium">
                {activeAnalysis.selectionRationale || activeAnalysis.modelSummary || `Selected because its strategic lens ("${activeAnalysis.strategicQuestion}") directly isolates the structural tension and core trade-offs of your dilemma.`}
              </p>
            </div>

            {/* DYNAMIC VISUAL FRAMEWORK RENDERER */}
            <div>
              <h4 className="font-serif font-bold text-slate-900 text-base mb-3 flex items-center space-x-2">
                <span>Visual Strategic Breakdown</span>
                <span className="text-xs font-sans font-normal text-slate-500">
                  ({activeAnalysis.visualType.toUpperCase()})
                </span>
              </h4>
              {renderVisualFramework(activeAnalysis)}
            </div>

            {/* TAKEAWAYS & ACTION PLAN & REFLECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              
              {/* Action Plan */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <ListOrdered className="w-4 h-4 text-indigo-600" />
                  <span>Immediate Action Roadmap</span>
                </div>
                <ol className="space-y-2 text-xs text-slate-800">
                  {activeAnalysis.actionPlan?.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="mt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Reflection Questions */}
              <div className="p-5 rounded-xl bg-indigo-50/50 border border-indigo-200/60 space-y-3">
                <div className="flex items-center space-x-2 text-indigo-950 font-bold text-xs uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-indigo-700" />
                  <span>Stress-Test Reflection Questions</span>
                </div>
                <ul className="space-y-2 text-xs text-indigo-950">
                  {activeAnalysis.reflectionQuestions?.map((q, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="font-bold text-indigo-600">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        )}
      </div>

    </div>
  );
};
