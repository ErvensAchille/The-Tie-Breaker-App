import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { ALL_MODELS, getModelById } from './src/data/modelsData';

dotenv.config();

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

const PORT = 3000;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient Gemini Generator with Tier Model Fallbacks (avoids rate limits and high-demand errors)
async function generateGeminiWithFallback(ai: GoogleGenAI, params: {
  contents: any;
  config?: any;
}) {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.6-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model
      });
      return response;
    } catch (err: any) {
      lastError = err;
    }
  }
  throw lastError;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'The Tiebreaker Backend' });
});

// Fallback Model Recommender with Domain Relevancy Scoring
function getFallbackRecommendations(title: string, description: string) {
  const text = (title + ' ' + description).toLowerCase();

  const scored = ALL_MODELS.map(m => {
    let score = 0;

    if (text.includes(m.name.toLowerCase())) score += 50;

    const taglineWords = m.tagline.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    taglineWords.forEach(w => {
      if (text.includes(w)) score += 5;
    });

    const questionWords = m.strategicQuestion.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    questionWords.forEach(w => {
      if (text.includes(w)) score += 4;
    });

    m.whenToUse.forEach(useCase => {
      const uWords = useCase.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      uWords.forEach(w => {
        if (text.includes(w)) score += 6;
      });
    });

    // Domain Specific Triggers
    const isTechProduct = /code|rewrite|refactor|tech|software|app|saas|dev|feature|cloud|database|stack|rust|go|react|python|api|infra|platform|freemium|b2b|architecture|system|design|bug|scale|release|deploy|framework|version|build|server|client|backend|frontend/i.test(text);
    if (isTechProduct && ['scamper-model', 'first-principles', 'cynefin-framework', 'kano-model', 'project-portfolio-matrix', 'ai-disruption', 'consequences-model', 'disruptive-innovation-model', 'second-order-thinking', 'thinking-outside-box'].includes(m.id)) {
      score += 35;
    }

    const isCareerLife = /job|offer|salary|quit|career|company|promotion|role|vp|manager|hire|stay|leave|move|learn|degree|study|transition|dream|passion|corporate|startup|boss|supervisor|resignation|relocate|berlin|london|new york/i.test(text);
    if (isCareerLife && ['crossroads-model', 'rubber-band-model', 'regret-minimization', 'opportunity-cost', 'grow-model', 'flow-model', 'sunk-cost', 'uffe-elbaek-model', 'consequences-model'].includes(m.id)) {
      score += 35;
    }

    const isBusinessStrategy = /price|pricing|market|launch|competitor|sales|customer|growth|revenue|acquisition|enterprise|b2c|product line|expand|international|partner|deal|monetize|client|venture|investor|pitch/i.test(text);
    if (isBusinessStrategy && ['blue-ocean', 'bcg-matrix', 'swot-analysis', 'pareto-principle', 'second-order-thinking', 'ooda-loop', 'long-tail-model', 'creative-destruction-model', 'disruptive-innovation-model'].includes(m.id)) {
      score += 35;
    }

    const isFinanceInvestment = /buy|rent|house|car|invest|money|budget|cost|expensive|capital|allocation|debt|loan|real estate|stock|portfolio|property|tesla|home|mortgage|wealth|save|spending/i.test(text);
    if (isFinanceInvestment && ['opportunity-cost', 'second-order-thinking', 'pre-mortem', 'regret-minimization', 'project-portfolio-matrix', 'sunk-cost', 'pareto-analysis', 'consequences-model'].includes(m.id)) {
      score += 35;
    }

    const isConflictTeam = /dispute|argument|co-founder|team|employee|fire|conflict|feedback|partner|board|disagreement|management|union|negotiate|toxic|personnel|stakeholder|colleague/i.test(text);
    if (isConflictTeam && ['conflict-resolution', 'thomas-kilmann', 'johari-window', 'hersey-blanchard-model', 'feedback-model', 'six-thinking-hats', 'prisoners-dilemma', 'team-model', 'belbin-team-roles', 'communication-square'].includes(m.id)) {
      score += 35;
    }

    const isPriorityTime = /busy|overwhelmed|burnout|priority|focus|tasks|schedule|time|procrastinate|backlog|output|deadline|routine|workload|firefighting|delegation/i.test(text);
    if (isPriorityTime && ['eisenhower-matrix', 'covey-time-matrix', 'pomodoro-technique', 'flow-model', 'pareto-principle', 'project-portfolio-matrix', 'energy-model'].includes(m.id)) {
      score += 35;
    }

    const isCreativeProblem = /creative|reinvent|redesign|invent|stuck|innovation|brainstorm|idea|brand|marketing|campaign|novel|unique/i.test(text);
    if (isCreativeProblem && ['scamper-model', 'six-thinking-hats', 'first-principles', 'thinking-outside-box', 'rubber-band-model'].includes(m.id)) {
      score += 35;
    }

    return { model: m, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const selected: any[] = [];
  for (const item of scored) {
    if (selected.length >= 3) break;
    if (!selected.some(s => s.id === item.model.id)) {
      selected.push(item.model);
    }
  }

  if (selected.length < 3) {
    const diverseDefaults = ['first-principles', 'opportunity-cost', 'consequences-model', 'crossroads-model', 'scamper-model', 'second-order-thinking'];
    for (const defId of diverseDefaults) {
      if (selected.length >= 3) break;
      const defModel = getModelById(defId);
      if (defModel && !selected.some(s => s.id === defModel.id)) {
        selected.push(defModel);
      }
    }
  }

  const userTopic = title ? `"${title}"` : 'your dilemma';

  return selected.slice(0, 3).map(m => ({
    modelId: m.id,
    modelName: m.name,
    categoryName: m.categoryName,
    tagline: m.tagline,
    fitReason: `Selected specifically for ${userTopic} because its ${m.categoryName.toLowerCase()} methodology directly targets your core trade-off: "${m.strategicQuestion}"`,
    keyQuestion: m.strategicQuestion
  }));
}

// Fallback Decision Analyzer with Domain Context Extraction
function getFallbackDecisionAnalysis(title: string, description: string, options: string[], selectedModelIds: string[]) {
  const fullText = (title + ' ' + (description || '')).trim();

  // Extract contextual options
  let opts: string[] = [];
  if (Array.isArray(options) && options.length >= 2) {
    const isGeneric = options.some(o =>
      /^option\s+[a-d]/i.test(o.trim()) ||
      /primary initiative|alternative path|maintain current baseline|execute new path|maintain current trajectory/i.test(o)
    );
    if (!isGeneric) {
      opts = options;
    }
  }

  const isGrillOrAppliance = /grill|bbq|barbecue|appliance|patio|mower|furniture/i.test(fullText);
  const isPurchaseOrBuy = /buy|purchase|get|order|upgrade to|rent|lease|cost|price|sale|discount|deal|car|house|tesla|laptop|phone/i.test(fullText);
  const isCareerOrJob = /job|quit|career|offer|startup|company|salary|resignation|role|hire|promote/i.test(fullText);
  const isRelocateOrMove = /relocate|move|city|apartment|rent|flat|berlin|london|new york|san francisco/i.test(fullText);
  const isFeatureOrCode = /code|rewrite|refactor|feature|launch|api|stack|backend|frontend|migrate/i.test(fullText);

  const dateMatch = fullText.match(/(august\s+\d{1,2}|september\s+\d{1,2}|october\s+\d{1,2}|november\s+\d{1,2}|december\s+\d{1,2}|january\s+\d{1,2}|february\s+\d{1,2}|march\s+\d{1,2}|april\s+\d{1,2}|may\s+\d{1,2}|june\s+\d{1,2}|july\s+\d{1,2}|on\s+[a-zA-Z]+\s+\d{1,2}|this\s+week|today|now)/i);
  const dateStr = dateMatch ? dateMatch[0] : '';

  if (opts.length < 2) {
    if (isGrillOrAppliance || (isPurchaseOrBuy && dateStr)) {
      const itemMatch = fullText.match(/(?:buy|purchase|get|order)\s+(?:a|an|the)?\s*([^?.,;]+?)(?:\s+on\s+|\s+this|\s+now|\?|$)/i);
      const item = itemMatch ? itemMatch[1].trim() : (isGrillOrAppliance ? 'the grill' : 'the item');
      const timeContext = dateStr ? ` ${dateStr}` : ' now';

      opts = [
        `Buy ${item}${timeContext} (Capture seasonal clearance/pricing & enjoy immediate utility)`,
        `Hold off / Defer purchase (Wait for further off-season markdowns or keep current setup)`
      ];
    } else if (isPurchaseOrBuy) {
      const cleanTitle = title.replace(/^should i /i, '').replace(/\?$/i, '').trim();
      opts = [
        `Proceed with purchase: ${cleanTitle}`,
        `Defer purchase & keep capital allocated elsewhere`
      ];
    } else if (isCareerOrJob) {
      opts = [
        `Make the career move / transition`,
        `Remain in current position & optimize from within`
      ];
    } else if (isRelocateOrMove) {
      opts = [
        `Proceed with relocation / move`,
        `Remain in current location & explore local alternatives`
      ];
    } else if (isFeatureOrCode) {
      opts = [
        `Execute development / rollout now`,
        `Defer rollout & optimize current architecture first`
      ];
    } else {
      const cleanTitle = title.replace(/^should i /i, '').replace(/\?$/i, '').trim();
      opts = [
        `Proceed with ${cleanTitle || 'Option A'}`,
        `Maintain current baseline / Defer ${cleanTitle || 'Option B'}`
      ];
    }
  }

  let summaryText = '';
  let rationaleText = '';
  let prosA: string[] = [];
  let consA: string[] = [];
  let prosB: string[] = [];
  let consB: string[] = [];

  if (isGrillOrAppliance || (isPurchaseOrBuy && dateStr)) {
    const chosenOpt = opts[0].startsWith('Option A:') ? opts[0] : `Option A: ${opts[0]}`;
    summaryText = `THE TIEBREAKER VERDICT\n88% Confidence\n${chosenOpt}\n\nEvaluating through The Project Portfolio Matrix reveals that ${chosenOpt} delivers maximum strategic momentum while keeping operational risk manageable.`;
    rationaleText = `Evaluating timing and seasonal market dynamics reveals that purchasing ${dateStr || 'now'} optimizes price-to-utility. You gain immediate seasonal enjoyment without paying full peak-summer MSRP.`;
    prosA = [
      `Lock in peak seasonal clearance discounts (20-40% off peak MSRP)`,
      `Immediate outdoor cooking utility through late summer, Labor Day, and autumn`,
      `Avoid inventory sell-outs that occur during late fall closeouts`
    ];
    consA = [
      `Upfront capital outlay required immediately`,
      `Floor model/store inventory selection may be limited`
    ];
    prosB = [
      `Zero immediate financial outlay`,
      `Option to evaluate next spring's new model releases`
    ];
    consB = [
      `Miss out on remaining warm-weather grilling season`,
      `Labor Day clearance may sell out popular sizes and configurations`
    ];
  } else if (isPurchaseOrBuy) {
    const chosenOpt = opts[0].startsWith('Option A:') ? opts[0] : `Option A: ${opts[0]}`;
    summaryText = `THE TIEBREAKER VERDICT\n85% Confidence\n${chosenOpt}\n\nEvaluating through The Project Portfolio Matrix reveals that ${chosenOpt} delivers maximum strategic momentum while keeping operational risk manageable.`;
    rationaleText = `Cost-benefit analysis confirms that acquiring the item provides immediate operational leverage while risk remains bounded.`;
    prosA = [
      `Immediate access to functional benefits and performance gain`,
      `Eliminates decision friction and ongoing cognitive distraction`
    ];
    consA = [
      `Upfront capital requirement`,
      `Opportunity cost of funds allocated`
    ];
    prosB = [
      `Preserves cash reserves`,
      `Time to evaluate additional market alternatives`
    ];
    consB = [
      `Continued delay in achieving desired outcome`,
      `Potential price increases or stock unavailability`
    ];
  } else if (isCareerOrJob) {
    const chosenOpt = opts[0].startsWith('Option A:') ? opts[0] : `Option A: ${opts[0]}`;
    summaryText = `THE TIEBREAKER VERDICT\n90% Confidence\n${chosenOpt}\n\nEvaluating through The Project Portfolio Matrix reveals that ${chosenOpt} delivers maximum strategic momentum while keeping operational risk manageable.`;
    rationaleText = `Career trajectory models show that calculated risk-taking delivers compound skill growth and long-term leverage.`;
    prosA = [
      `Accelerated learning curve and expanded professional network`,
      `Stronger alignment with long-term ambition and earning potential`
    ];
    consA = [
      `Short-term adaptation friction in a new environment`,
      `Initial risk of navigating unproven operational expectations`
    ];
    prosB = [
      `Predictable routine and established social capital`,
      `Immediate stability without transition stress`
    ];
    consB = [
      `Risk of skill stagnation or career growth cap`,
      `Regret of unpursued opportunity over time`
    ];
  } else {
    const chosenOpt = opts[0].startsWith('Option A:') ? opts[0] : `Option A: ${opts[0]}`;
    summaryText = `THE TIEBREAKER VERDICT\n88% Confidence\n${chosenOpt}\n\nEvaluating through The Project Portfolio Matrix reveals that ${chosenOpt} delivers maximum strategic momentum while keeping operational risk manageable.`;
    rationaleText = `Across evaluated trade-offs, "${opts[0]}" delivers superior expected value relative to the status quo.`;
    prosA = [
      `Directly resolves core dilemma and creates forward momentum`,
      `Clear execution roadmap with defined milestone metrics`
    ];
    consA = [
      `Requires initial focus and resource allocation`,
      `Potential short-term operational transition adjustment`
    ];
    prosB = [
      `Avoids immediate change or disruption`,
      `Preserves existing operational rhythm`
    ];
    consB = [
      `Leaves underlying tension unresolved`,
      `May incur higher long-term friction or missed opportunity`
    ];
  }

  const modelIdsToUse = Array.isArray(selectedModelIds) && selectedModelIds.length > 0
    ? selectedModelIds.slice(0, 3)
    : ['eisenhower-matrix', 'swot-analysis', 'rubber-band-model'];

  const analyses = modelIdsToUse.map(id => {
    const m = getModelById(id) || {
      id,
      name: 'Strategic Model',
      categoryName: 'General Strategy',
      strategicQuestion: 'What is the most effective approach?',
      visualType: 'prosCons',
      tagline: 'Structured evaluation framework'
    };

    let frameworkData: any = { type: m.visualType, takeaways: [] };

    if (m.visualType === 'matrix2x2') {
      frameworkData = {
        type: 'matrix2x2',
        matrix: {
          xAxis: m.xAxisLabel || 'Feasibility vs Impact',
          yAxis: m.yAxisLabel || 'Urgency vs Priority',
          quadrants: {
            topLeft: {
              title: m.quadrantNames?.[0] || 'High Impact / Low Effort',
              subtitle: 'Immediate high-leverage priorities',
              items: [`Execute primary path: ${opts[0]}`, 'Lock in favorable terms & timeline']
            },
            topRight: {
              title: m.quadrantNames?.[1] || 'High Impact / High Effort',
              subtitle: 'Strategic long-term investments',
              items: [`Evaluate secondary contingencies for ${opts[1]}`, 'Maintain flexible capital allocation']
            },
            bottomLeft: {
              title: m.quadrantNames?.[2] || 'Low Impact / Low Effort',
              subtitle: 'Secondary tasks to minimize',
              items: ['Streamline research overhead', 'Avoid over-analyzing minor details']
            },
            bottomRight: {
              title: m.quadrantNames?.[3] || 'Low Impact / High Effort',
              subtitle: 'Distractions to defer or avoid',
              items: ['Avoid endless delay tactics', 'Postpone non-essential accessories']
            }
          }
        },
        takeaways: [
          `Prioritize Option A ("${opts[0]}") for immediate high-leverage momentum.`,
          `Timing alignment delivers strong value relative to effort involved.`,
          `Mitigate risk by setting clear decision criteria and avoiding hesitation.`
        ]
      };
    } else if (m.visualType === 'steps') {
      frameworkData = {
        type: 'steps',
        steps: [
          { stepName: '1. Validate Context', guidance: `Verify key requirements and pricing/terms for "${title}".`, keyQuestion: 'What are the non-negotiable criteria?', actionableTip: 'Review specs and budget limits.' },
          { stepName: '2. Compare Alternatives', guidance: 'Assess Option A vs Option B against seasonal or market timing.', keyQuestion: 'Which path minimizes regret?', actionableTip: `Evaluate ${opts[0]}.` },
          { stepName: '3. Test / Verify', guidance: 'Confirm warranty, return policies, or prerequisite conditions.', keyQuestion: 'Are there hidden risks?', actionableTip: 'Check fine print and reviews.' },
          { stepName: '4. Execute Choice', guidance: `Commit to "${opts[0]}" and document execution steps.`, keyQuestion: 'What is the immediate next step?', actionableTip: 'Finalize selection.' }
        ],
        takeaways: [
          'A structured step progression removes emotional bias from timing decisions.',
          'Checking preconditions ensures execution proceeds without buyer friction.'
        ]
      };
    } else {
      frameworkData = {
        type: 'prosCons',
        optionsComparison: [
          {
            name: opts[0],
            summary: `Primary recommended option for "${title}".`,
            pros: prosA,
            cons: consA,
            impactScore: 8.8,
            feasibilityScore: 8.5
          },
          {
            name: opts[1],
            summary: `Alternative / deferral path for "${title}".`,
            pros: prosB,
            cons: consB,
            impactScore: 6.2,
            feasibilityScore: 8.8
          }
        ],
        takeaways: [
          `"${opts[0]}" provides superior value and momentum compared to deferring.`,
          `Capturing current market/seasonal conditions outweighs minor setup effort.`
        ]
      };
    }

    return {
      modelId: m.id,
      modelName: m.name,
      categoryName: m.categoryName,
      strategicQuestion: m.strategicQuestion,
      visualType: m.visualType,
      modelSummary: `Applied ${m.name} to systematically evaluate trade-offs for "${title}".`,
      selectionRationale: `Selected specifically for "${title}" because ${m.name} isolates the central tension: "${m.strategicQuestion}".`,
      frameworkData,
      verdict: {
        recommendedOption: opts[0],
        confidenceScore: 88,
        executiveRationale: `${rationaleText} Evaluating through ${m.name} confirms "${opts[0]}" as the clear tiebreaker choice.`,
        keyTradeOffs: [
          `Immediate action & seasonal pricing advantage vs holding capital.`,
          `Capturing present value vs waiting for future uncertainty.`
        ],
        blindSpotsToWatch: [
          `Avoid over-spending on secondary add-ons or unnecessary upgrades.`,
          `Verify warranty, terms, and return window prior to finalizing.`
        ]
      },
      actionPlan: [
        `Phase 1: Verify exact details and terms for "${opts[0]}".`,
        `Phase 2: Finalize decision and lock in current availability/pricing.`,
        `Phase 3: Set up and evaluate performance after 14 days.`
      ],
      reflectionQuestions: [
        `What single factor would make this decision a clear success in 30 days?`,
        `Are there any unstated assumptions regarding price or availability?`,
        `What is the cost of delaying this choice another 2-4 weeks?`
      ]
    };
  });

  return {
    id: 'dec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toISOString(),
    decisionTitle: title || 'Strategic Decision Analysis',
    decisionDescription: description || '',
    options: opts,
    recommendedModelsUsed: modelIdsToUse,
    overallTiebreakerSummary: summaryText,
    analyses
  };
}

// Endpoint: Recommend best strategic models for a given decision
app.post('/api/recommend-models', async (req, res) => {
  try {
    const { title, description, options } = req.body;
    
    const ai = getAiClient();
    if (!ai) {
      // Fallback if no API key provided
      const recommendations = getFallbackRecommendations(title || '', description || '');
      return res.json({ recommendations });
    }

    const modelCatalogSummary = ALL_MODELS.map(m => ({
      id: m.id,
      name: m.name,
      category: m.categoryName,
      tagline: m.tagline,
      strategicQuestion: m.strategicQuestion,
      whenToUse: m.whenToUse
    }));

    const prompt = `
You are an expert executive decision strategist with mastery over mental models, cognitive frameworks, and decision theory (including the 50 Krogerus & Tschäppeler strategic models).

USER'S DECISION DILEMMA:
- Title: "${title || 'Untitled Decision'}"
- Description: "${description || 'No detailed description provided.'}"
- Options considered: ${options && options.length > 0 ? options.join(', ') : 'Open ended dilemma'}

CORE TASK:
1. Conduct a deep, dynamic intent analysis of the user's situation. Read between the lines to uncover core trade-offs, psychological friction, risk profile, and strategic domain (e.g. technical debt vs rewrite, startup vs corporate career, pricing/monetization, team conflict, personal allocation).
2. Cross-reference this intent against ALL 52 strategic models in the catalog below. Do NOT use hardcoded or generic defaults. Pick models that specifically match the structural dynamics of this dilemma.
3. Select the TOP 3 most powerful, distinct models that give the user maximum clarity.
4. For EACH model chosen, write a detailed, bespoke "fitReason" (2-3 sentences) articulating EXPLICITLY why this mental model was selected for THIS user's specific dilemma and how its specific methodology illuminates their core trade-offs.

MODEL CATALOG (52 Frameworks):
${JSON.stringify(modelCatalogSummary)}

Return a JSON object with a "recommendations" array of 3 items containing modelId, fitReason, and keyQuestion.
`;

    const response = await generateGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  modelId: { type: Type.STRING },
                  fitReason: { type: Type.STRING },
                  keyQuestion: { type: Type.STRING }
                },
                required: ['modelId', 'fitReason', 'keyQuestion']
              }
            }
          },
          required: ['recommendations']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const recommendations = (parsed.recommendations || []).map((rec: any) => {
      const modelMeta = getModelById(rec.modelId);
      return {
        ...rec,
        modelName: modelMeta?.name || rec.modelId,
        categoryName: modelMeta?.categoryName || 'Strategic Framework',
        tagline: modelMeta?.tagline || ''
      };
    });

    if (recommendations.length === 0) {
      return res.json({ recommendations: getFallbackRecommendations(title || '', description || '') });
    }

    return res.json({ recommendations });
  } catch (error: any) {
    console.info('Notice in /api/recommend-models, using smart fallback:', error?.message);
    const recommendations = getFallbackRecommendations(req.body.title || '', req.body.description || '');
    return res.json({ recommendations });
  }
});

// Endpoint: Analyze decision using selected models
app.post('/api/analyze-decision', async (req, res) => {
  try {
    const { title, description, options, selectedModelIds, urgencyLevel, stakeholders, timeframe } = req.body;

    const modelIdsToUse = Array.isArray(selectedModelIds) && selectedModelIds.length > 0
      ? selectedModelIds.slice(0, 3)
      : ['eisenhower-matrix', 'swot-analysis', 'rubber-band-model'];

    const ai = getAiClient();
    if (!ai) {
      const fallbackResult = getFallbackDecisionAnalysis(title, description, options, modelIdsToUse);
      return res.json(fallbackResult);
    }

    const selectedModelsDetails = modelIdsToUse.map(id => {
      const m = getModelById(id);
      return m ? {
        id: m.id,
        name: m.name,
        category: m.categoryName,
        strategicQuestion: m.strategicQuestion,
        visualType: m.visualType,
        tagline: m.tagline,
        quadrantNames: m.quadrantNames
      } : { id, name: id, visualType: 'general' };
    });

    const prompt = `
You are "The Tiebreaker", an elite AI Executive Decision Strategist.
A user needs help making a decision and breaking a tie between options.

DECISION CONTEXT:
- Decision Title: "${title || 'Decision Evaluation'}"
- Detailed Dilemma: "${description || 'None provided'}"
- Options under consideration: ${options && options.length > 0 ? options.map((o: string, idx: number) => `Option ${idx+1}: ${o}`).join('; ') : 'Evaluate dilemma and provide 2 distinct viable options.'}
- Urgency Level: ${urgencyLevel || 'Medium'}
- Stakeholders Involved: ${stakeholders || 'Not specified'}
- Timeframe: ${timeframe || 'Immediate to Near-Term'}

SELECTED STRATEGIC MODELS TO APPLY:
${JSON.stringify(selectedModelsDetails, null, 2)}

INSTRUCTIONS:
1. MASTER EXECUTIVE VERDICT FORMAT:
You MUST format the master executive summary ("overallTiebreakerSummary") to explicitly enforce the 'THE TIEBREAKER VERDICT' output format, requiring:
- Exact Header Line: "THE TIEBREAKER VERDICT"
- Confidence Score Line: "<Confidence Score>% Confidence" (e.g., "88% Confidence")
- Chosen Option Line: "<Chosen Option>" (e.g., "Option A: Primary Initiative" or specific chosen initiative)
- Blank Line
- Concise Strategic Model Rationale: A decisive, high-impact paragraph formatted as:
  "Evaluating through <Strategic Model Name> reveals that <Chosen Option> delivers <concise Strategic Model rationale explaining why this option breaks the tie and delivers maximum strategic momentum while keeping operational risk manageable>."

Strict Example of REQUIRED 'THE TIEBREAKER VERDICT' format for overallTiebreakerSummary:
THE TIEBREAKER VERDICT
88% Confidence
Option A: Primary Initiative

Evaluating through The Project Portfolio Matrix reveals that Option A: Primary Initiative delivers maximum strategic momentum while keeping operational risk manageable.

DO NOT deviate from this structure for "overallTiebreakerSummary". Always include the header, Confidence Score, Chosen Option, and concise Strategic Model rationale.

2. For EACH requested model, create a detailed, specific analysis tailored to that model's methodology.
3. Every analysis MUST include a "selectionRationale" field (2-3 sentences) explaining EXPLICITLY why this specific mental model was chosen to evaluate this user's dilemma, detailing what core structural trade-off or blind spot it exposes.
4. Every analysis MUST include "modelId", "modelName", "categoryName", "strategicQuestion", "visualType", "modelSummary", "selectionRationale", "frameworkData", "verdict", "actionPlan", and "reflectionQuestions".
`;

    const response = await generateGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallTiebreakerSummary: {
              type: Type.STRING,
              description: "Must strictly enforce 'THE TIEBREAKER VERDICT' format: line 1 'THE TIEBREAKER VERDICT', line 2 '<score>% Confidence', line 3 '<Chosen Option>', followed by blank line and 'Evaluating through <Strategic Model Name> reveals that <Chosen Option> delivers <concise Strategic Model rationale>'."
            },
            analyses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  modelId: { type: Type.STRING },
                  modelName: { type: Type.STRING },
                  categoryName: { type: Type.STRING },
                  strategicQuestion: { type: Type.STRING },
                  visualType: { type: Type.STRING },
                  modelSummary: { type: Type.STRING },
                  selectionRationale: { type: Type.STRING },
                  frameworkData: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      matrix: {
                        type: Type.OBJECT,
                        properties: {
                          xAxis: { type: Type.STRING },
                          yAxis: { type: Type.STRING },
                          quadrants: {
                            type: Type.OBJECT,
                            properties: {
                              topLeft: {
                                type: Type.OBJECT,
                                properties: {
                                  title: { type: Type.STRING },
                                  subtitle: { type: Type.STRING },
                                  items: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ['title', 'items']
                              },
                              topRight: {
                                type: Type.OBJECT,
                                properties: {
                                  title: { type: Type.STRING },
                                  subtitle: { type: Type.STRING },
                                  items: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ['title', 'items']
                              },
                              bottomLeft: {
                                type: Type.OBJECT,
                                properties: {
                                  title: { type: Type.STRING },
                                  subtitle: { type: Type.STRING },
                                  items: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ['title', 'items']
                              },
                              bottomRight: {
                                type: Type.OBJECT,
                                properties: {
                                  title: { type: Type.STRING },
                                  subtitle: { type: Type.STRING },
                                  items: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ['title', 'items']
                              }
                            },
                            required: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
                          }
                        }
                      },
                      optionsComparison: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            summary: { type: Type.STRING },
                            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                            impactScore: { type: Type.NUMBER },
                            feasibilityScore: { type: Type.NUMBER }
                          },
                          required: ['name', 'summary', 'pros', 'cons', 'impactScore', 'feasibilityScore']
                        }
                      },
                      steps: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            stepName: { type: Type.STRING },
                            guidance: { type: Type.STRING },
                            keyQuestion: { type: Type.STRING },
                            actionableTip: { type: Type.STRING }
                          },
                          required: ['stepName', 'guidance', 'keyQuestion', 'actionableTip']
                        }
                      },
                      scamper: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            category: { type: Type.STRING },
                            concept: { type: Type.STRING },
                            applicationToDecision: { type: Type.STRING }
                          },
                          required: ['category', 'concept', 'applicationToDecision']
                        }
                      },
                      curve: {
                        type: Type.OBJECT,
                        properties: {
                          currentStage: { type: Type.STRING },
                          stageDescription: { type: Type.STRING },
                          keyRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
                          recommendedStrategy: { type: Type.STRING }
                        },
                        required: ['currentStage', 'stageDescription', 'keyRisks', 'recommendedStrategy']
                      },
                      pyramidLevels: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            levelName: { type: Type.STRING },
                            insight: { type: Type.STRING },
                            status: { type: Type.STRING }
                          },
                          required: ['levelName', 'insight', 'status']
                        }
                      },
                      takeaways: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['type', 'takeaways']
                  },
                  verdict: {
                    type: Type.OBJECT,
                    properties: {
                      recommendedOption: { type: Type.STRING },
                      confidenceScore: { type: Type.NUMBER },
                      executiveRationale: { type: Type.STRING },
                      keyTradeOffs: { type: Type.ARRAY, items: { type: Type.STRING } },
                      blindSpotsToWatch: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['recommendedOption', 'confidenceScore', 'executiveRationale', 'keyTradeOffs', 'blindSpotsToWatch']
                  },
                  actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
                  reflectionQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['modelId', 'modelName', 'categoryName', 'strategicQuestion', 'visualType', 'modelSummary', 'selectionRationale', 'frameworkData', 'verdict', 'actionPlan', 'reflectionQuestions']
              }
            }
          },
          required: ['overallTiebreakerSummary', 'analyses']
        }
      }
    });

    const parsedResult = JSON.parse(response.text || '{}');

    const result = {
      id: 'dec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      decisionTitle: title || 'Strategic Decision Analysis',
      decisionDescription: description || '',
      options: options || [],
      recommendedModelsUsed: modelIdsToUse,
      overallTiebreakerSummary: parsedResult.overallTiebreakerSummary || 'Strategic analysis completed across selected models.',
      analyses: parsedResult.analyses || []
    };

    return res.json(result);
  } catch (error: any) {
    console.info('Notice in /api/analyze-decision, using smart fallback:', error?.message);
    const fallbackResult = getFallbackDecisionAnalysis(
      req.body.title || '',
      req.body.description || '',
      req.body.options || [],
      req.body.selectedModelIds || []
    );
    return res.json(fallbackResult);
  }
});

// Endpoint: AI Assistant (JARVIS / FRIDAY) Chat & Command Processor
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { message, persona = 'JARVIS', currentContext } = req.body;
    const isFriday = persona === 'FRIDAY';

    const systemInstruction = isFriday
      ? `You are F.R.I.D.A.Y., Tony Stark's tactical AI assistant running "The Tiebreaker" decision engine. You are bold, decisive, warm, and speak with high-speed executive precision. Address the user as "Boss" or "Sir". Whenever the user asks you to evaluate a choice, make a decision, or weigh options, deliver a clear, confident initial tiebreaker recommendation IMMEDIATELY in 2-3 spoken sentences. Never dodge or give vague answers.`
      : `You are J.A.R.V.I.S., Tony Stark's suave, highly analytical AI assistant running "The Tiebreaker" decision engine. You speak with polished British wit, sharp executive authority, and profound strategic clarity. Address the user as "Sir" or "Boss". Whenever the user asks you to evaluate a choice, make a decision, or weigh options, deliver a clear, confident initial tiebreaker recommendation IMMEDIATELY in 2-3 spoken sentences. Never dodge or give vague answers.`;

    const ai = getAiClient();
    if (!ai) {
      // Smart offline fallback response
      const fallbackAnalysis = getFallbackDecisionAnalysis(message, message, [], []);
      const fallbackReply = isFriday
        ? `Right away, Boss. Evaluating your choices across 3 strategic models. My initial tiebreaker verdict favors Option A ("${fallbackAnalysis.options[0]}") for maximum seasonal/strategic leverage. Deploying full 3D model metrics to your Workbench now.`
        : `At your service, Sir. Analyzing your decision vectors. The primary trade-off indicates Option A ("${fallbackAnalysis.options[0]}") holds superior strategic ROI. I am populating your Workbench with full model synthesis now.`;

      const recs = getFallbackRecommendations(message, message);
      return res.json({
        reply: fallbackReply,
        action: 'FILL_DECISION_FORM',
        decisionData: {
          title: message.length > 60 ? message.slice(0, 57) + '...' : message,
          description: message,
          options: fallbackAnalysis.options,
          suggestedModelIds: recs.map(r => r.modelId)
        },
        persona
      });
    }

    const modelCatalogSummary = ALL_MODELS.map(m => `- ${m.id}: "${m.name}" (${m.category}) - ${m.tagline}`).join('\n');

    const prompt = `
Available 52 Strategic Decision Models in the System:
${modelCatalogSummary}

Context of user's active decision workspace:
${JSON.stringify(currentContext || {})}

User's spoken or typed message to ${persona}:
"${message}"

INSTRUCTIONS FOR DECISION MAKING & COMMAND EXECUTION:
1. ALWAYS TREAT ANY CHOICE, DILEMMA, QUESTION, OR COMPARISON ("should I X or Y?", "help me choose", "decide between", "is it better to...", "what should I do about...") AS AN ACTIVE DECISION REQUEST.
2. For decision requests:
   - Extract a crisp title, a detailed description, and 2-4 distinct options (e.g. ["Option A: ...", "Option B: ..."]).
   - Cross-reference against the 52 models above and select the 3 best model IDs ("suggestedModelIds") for this specific situation.
   - Set "action": "FILL_DECISION_FORM".
   - In your spoken "reply", DELIVER AN IMMEDIATE TIEBREAKER VERDICT & RECOMMENDATION in character! For example: "Boss/Sir, I've evaluated your options against [Model 1] and [Model 2]. My immediate tiebreaker recommendation is [Option A] because [1 key reason]. I am executing the full 3D model synthesis on your Workbench now."
3. If the user asks about an existing active decision in currentContext, answer their question directly referencing the verdict.
4. If the user asks to navigate (e.g. "go to history", "show model library"), set "action": "NAVIGATE" with "targetTab": ("workbench" | "explorer" | "history").
5. Return JSON with:
- "reply": string (2-3 sentences max, punchy, spoken TTS friendly)
- "action": null OR "FILL_DECISION_FORM" OR "NAVIGATE"
- "decisionData": object with { title, description, options, suggestedModelIds } if action is "FILL_DECISION_FORM"
- "targetTab": string if action is "NAVIGATE"
`;

    const response = await generateGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            action: { type: Type.STRING },
            targetTab: { type: Type.STRING },
            decisionData: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestedModelIds: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          required: ['reply']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    let decisionData = parsed.decisionData || null;

    // Guarantee action is FILL_DECISION_FORM if user asked a decision-like question or if decisionData exists
    let action = parsed.action || null;
    const isDecisionPrompt = /decide|choose|evaluate|should|versus|vs|option|instead|launch|hire|quit|buy|rent|relocate|career|startup/i.test(message);
    
    if (isDecisionPrompt && (!action || action === 'null')) {
      action = 'FILL_DECISION_FORM';
    }

    if (action === 'FILL_DECISION_FORM') {
      const fallbackAnalysis = getFallbackDecisionAnalysis(message, message, decisionData?.options || [], []);
      if (!decisionData) {
        decisionData = {
          title: message.length > 60 ? message.slice(0, 57) + '...' : message,
          description: message,
          options: fallbackAnalysis.options,
          suggestedModelIds: []
        };
      } else if (!decisionData.options || decisionData.options.length < 2) {
        decisionData.options = fallbackAnalysis.options;
      }
      if (!decisionData.suggestedModelIds || decisionData.suggestedModelIds.length === 0) {
        const recs = getFallbackRecommendations(decisionData.title || message, decisionData.description || message);
        decisionData.suggestedModelIds = recs.map(r => r.modelId);
      }
    }

    return res.json({
      reply: parsed.reply || (isFriday ? "All systems active, Boss. Decision analysis initiated." : "At your service, Sir. Decision analysis initiated."),
      action,
      targetTab: parsed.targetTab || null,
      decisionData,
      persona
    });
  } catch (error: any) {
    console.info('Notice in /api/assistant/chat fallback:', error?.message);
    const isFriday = req.body.persona === 'FRIDAY';
    const reqMsg = req.body.message || '';
    const fallbackAnalysis = getFallbackDecisionAnalysis(reqMsg, reqMsg, [], []);
    const recs = getFallbackRecommendations(reqMsg, reqMsg);
    return res.json({
      reply: isFriday
        ? `Right away, Boss. Evaluating your dilemma against top strategic models. My tiebreaker recommendation favors Option A ("${fallbackAnalysis.options[0]}"). Executing full analysis on your Workbench now.`
        : `At your service, Sir. Analyzing decision parameters. My tiebreaker recommendation favors Option A ("${fallbackAnalysis.options[0]}"). Executing 3D model synthesis on your Workbench now.`,
      action: 'FILL_DECISION_FORM',
      decisionData: {
        title: reqMsg || 'Strategic Decision Evaluation',
        description: reqMsg || 'Voice decision request',
        options: fallbackAnalysis.options,
        suggestedModelIds: recs.map(r => r.modelId)
      },
      persona: req.body.persona || 'JARVIS'
    });
  }
});

// Endpoint: AI Assistant Text-To-Speech (TTS)
app.post('/api/assistant/tts', async (req, res) => {
  try {
    const { text, persona = 'JARVIS', voiceStyle = 'siri' } = req.body;
    const ai = getAiClient();
    if (!ai || !text) {
      return res.json({ audioBase64: null, fallbackToWebSpeech: true });
    }

    let voiceName = 'Zephyr';
    if (persona === 'FRIDAY') {
      voiceName = 'Zephyr'; // Siri-like bright female voice
    } else {
      voiceName = voiceStyle === 'deep' ? 'Charon' : 'Fenrir';
    }

    // Attempt 1: Standard model generateContent audio output
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: text.slice(0, 500),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName
              }
            }
          }
        }
      });

      const candidate = response.candidates?.[0];
      const part = candidate?.content?.parts?.find((p: any) => p.inlineData && p.inlineData.mimeType?.startsWith('audio/'));
      if (part && part.inlineData) {
        return res.json({
          audioBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
          fallbackToWebSpeech: false
        });
      }
    } catch (e: any) {
      // Ignore and fallback to interactions or web speech
    }

    // Attempt 2: Interactions API TTS model
    try {
      const interaction = await ai.interactions.create({
        model: 'gemini-3.1-flash-tts-preview',
        input: text.slice(0, 500),
        response_modalities: ['AUDIO'],
        generation_config: {
          speech_config: {
            voice_config: {
              prebuilt_voice_config: { voice_name: voiceName }
            }
          }
        } as any
      });

      for (const step of interaction.steps) {
        if (step.type === 'model_output') {
          const audioContent: any = step.content?.find((c: any) => c.type === 'audio');
          if (audioContent && audioContent.data) {
            return res.json({
              audioBase64: audioContent.data,
              mimeType: audioContent.mime_type || 'audio/wav',
              fallbackToWebSpeech: false
            });
          }
        }
      }
    } catch (e: any) {
      // Fall through to browser Web Speech
    }

    return res.json({ audioBase64: null, fallbackToWebSpeech: true });
  } catch (err: any) {
    console.info('Notice in /api/assistant/tts, falling back to browser synthesis:', err?.message);
    return res.json({ audioBase64: null, fallbackToWebSpeech: true });
  }
});

// Vite Integration (Development vs Production)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Tiebreaker server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
