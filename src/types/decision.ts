export type ModelCategory = 'part1' | 'part2' | 'part3' | 'part4' | 'part5';

export type VisualType = 'matrix2x2' | 'prosCons' | 'steps' | 'curve' | 'scamper' | 'pyramid' | 'general';

export interface StrategicModel {
  id: string;
  name: string;
  category: ModelCategory;
  categoryName: string;
  tagline: string;
  strategicQuestion: string;
  description: string;
  visualType: VisualType;
  xAxisLabel?: string;
  yAxisLabel?: string;
  quadrantNames?: [string, string, string, string]; // Top-Left, Top-Right, Bottom-Left, Bottom-Right
  whenToUse: string[];
  exampleDilemma: string;
  author?: string;
  isCustom?: boolean;
}

export interface DecisionInput {
  title: string;
  description: string;
  options: string[]; // e.g. ["Option A: Accept Offer", "Option B: Stay at current company"]
  selectedModelIds: string[];
  urgencyLevel?: 'low' | 'medium' | 'high';
  stakeholders?: string;
  timeframe?: string;
}

export interface QuadrantData {
  title: string;
  subtitle?: string;
  items: string[];
  colorTheme?: string;
}

export interface OptionComparison {
  name: string;
  summary: string;
  pros: string[];
  cons: string[];
  impactScore: number; // 1 to 10
  feasibilityScore: number; // 1 to 10
}

export interface StepItem {
  stepName: string;
  guidance: string;
  keyQuestion: string;
  actionableTip: string;
}

export interface ScamperElement {
  category: string;
  concept: string;
  applicationToDecision: string;
}

export interface CurveStage {
  currentStage: string;
  stageDescription: string;
  keyRisks: string[];
  recommendedStrategy: string;
}

export interface FrameworkData {
  type: VisualType;
  // Matrix 2x2 data (if type === 'matrix2x2')
  matrix?: {
    xAxis: string;
    yAxis: string;
    quadrants: {
      topLeft: QuadrantData;
      topRight: QuadrantData;
      bottomLeft: QuadrantData;
      bottomRight: QuadrantData;
    };
  };
  // Pros/Cons Scorecard data
  optionsComparison?: OptionComparison[];
  // Steps/Phase framework data (e.g., GROW, Kotter, Kaizen)
  steps?: StepItem[];
  // Scamper/Morphological framework
  scamper?: ScamperElement[];
  // Curve/Lifecycle framework (e.g., S-Curve, Gartner Hype Cycle, Chasm)
  curve?: CurveStage;
  // Pyramid/Hierarchy framework (e.g., Maslow)
  pyramidLevels?: {
    levelName: string;
    insight: string;
    status: 'fulfilled' | 'at-risk' | 'blocker' | 'opportunity';
  }[];
  // Key takeaways
  takeaways: string[];
}

export interface Verdict {
  recommendedOption: string;
  confidenceScore: number; // 1-100
  executiveRationale: string;
  keyTradeOffs: string[];
  blindSpotsToWatch: string[];
}

export interface SingleModelAnalysis {
  modelId: string;
  modelName: string;
  categoryName: string;
  strategicQuestion: string;
  visualType: VisualType;
  modelSummary: string;
  selectionRationale?: string; // Bespoke explanation of why this model was chosen for the specific dilemma
  frameworkData: FrameworkData;
  verdict: Verdict;
  actionPlan: string[];
  reflectionQuestions: string[];
}

export interface DecisionAnalysisResult {
  id: string;
  createdAt: string;
  decisionTitle: string;
  decisionDescription: string;
  options: string[];
  recommendedModelsUsed: string[];
  overallTiebreakerSummary: string;
  analyses: SingleModelAnalysis[];
}

export interface SavedDecision {
  id: string;
  createdAt: string;
  title: string;
  description: string;
  options: string[];
  status: 'Pending' | 'Decided' | 'In Progress' | 'Archived';
  selectedOption?: string;
  result: DecisionAnalysisResult;
  userNotes?: string;
  decisionDate?: string;
}
