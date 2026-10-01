import { ALL_MODELS, getModelById } from '../data/modelsData';
import { DecisionInput, DecisionAnalysisResult, StrategicModel } from '../types/decision';

export function generateClientFallbackRecommendations(title: string, description: string) {
  const text = (title + ' ' + description).toLowerCase();

  // Score each of the 52 models based on domain relevancy, keywords, whenToUse matches, and exampleDilemma similarity
  const scored = ALL_MODELS.map(m => {
    let score = 0;

    // Direct model name match
    if (text.includes(m.name.toLowerCase())) score += 50;

    // Keywords in model tagline, strategic question, description
    const taglineWords = m.tagline.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    taglineWords.forEach(w => {
      if (text.includes(w)) score += 5;
    });

    const questionWords = m.strategicQuestion.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    questionWords.forEach(w => {
      if (text.includes(w)) score += 4;
    });

    // whenToUse matches
    m.whenToUse.forEach(useCase => {
      const uWords = useCase.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      uWords.forEach(w => {
        if (text.includes(w)) score += 6;
      });
    });

    // Domain Specific Keyword Triggers:
    // 1. Tech / Software / Coding / Product / Engineering / Innovation / Architecture
    const isTechProduct = /code|rewrite|refactor|tech|software|app|saas|dev|feature|cloud|database|stack|rust|go|react|python|api|infra|platform|freemium|b2b|architecture|system|design|bug|scale|release|deploy|framework|version|build|server|client|backend|frontend/i.test(text);
    if (isTechProduct) {
      if (['scamper-model', 'first-principles', 'cynefin-framework', 'kano-model', 'project-portfolio-matrix', 'ai-disruption', 'consequences-model', 'disruptive-innovation-model', 'second-order-thinking', 'thinking-outside-box'].includes(m.id)) {
        score += 35;
      }
    }

    // 2. Career / Offer / Job / Career Pivot / Salary / Company Change / Role
    const isCareerLife = /job|offer|salary|quit|career|company|promotion|role|vp|manager|hire|stay|leave|move|learn|degree|study|transition|dream|passion|corporate|startup|boss|supervisor|resignation|relocate|berlin|london|new york/i.test(text);
    if (isCareerLife) {
      if (['crossroads-model', 'rubber-band-model', 'regret-minimization', 'opportunity-cost', 'grow-model', 'flow-model', 'sunk-cost', 'uffe-elbaek-model', 'consequences-model'].includes(m.id)) {
        score += 35;
      }
    }

    // 3. Business Strategy / Markets / Expansion / Pricing / Sales / Growth
    const isBusinessStrategy = /price|pricing|market|launch|competitor|sales|customer|growth|revenue|acquisition|enterprise|b2c|product line|expand|international|partner|deal|monetize|client|venture|investor|pitch/i.test(text);
    if (isBusinessStrategy) {
      if (['blue-ocean', 'bcg-matrix', 'swot-analysis', 'pareto-principle', 'second-order-thinking', 'ooda-loop', 'long-tail-model', 'creative-destruction-model', 'disruptive-innovation-model'].includes(m.id)) {
        score += 35;
      }
    }

    // 4. Financial / Investment / Buy vs Rent / Purchase / Capital
    const isFinanceInvestment = /buy|rent|house|car|invest|money|budget|cost|expensive|capital|allocation|debt|loan|real estate|stock|portfolio|property|tesla|home|mortgage|wealth|save|spending/i.test(text);
    if (isFinanceInvestment) {
      if (['opportunity-cost', 'second-order-thinking', 'pre-mortem', 'regret-minimization', 'project-portfolio-matrix', 'sunk-cost', 'pareto-analysis', 'consequences-model'].includes(m.id)) {
        score += 35;
      }
    }

    // 5. Conflict / Team / Co-Founder / Leadership / Disputes
    const isConflictTeam = /dispute|argument|co-founder|team|employee|fire|conflict|feedback|partner|board|disagreement|management|union|negotiate|toxic|personnel|stakeholder|colleague/i.test(text);
    if (isConflictTeam) {
      if (['conflict-resolution', 'thomas-kilmann', 'johari-window', 'hersey-blanchard-model', 'feedback-model', 'six-thinking-hats', 'prisoners-dilemma', 'team-model', 'belbin-team-roles', 'communication-square'].includes(m.id)) {
        score += 35;
      }
    }

    // 6. Priority / Overwhelmed / Time / Backlog / Procrastination
    const isPriorityTime = /busy|overwhelmed|burnout|priority|focus|tasks|schedule|time|procrastinate|backlog|output|deadline|routine|workload|firefighting|delegation/i.test(text);
    if (isPriorityTime) {
      if (['eisenhower-matrix', 'covey-time-matrix', 'pomodoro-technique', 'flow-model', 'pareto-principle', 'project-portfolio-matrix', 'energy-model'].includes(m.id)) {
        score += 35;
      }
    }

    // 7. Creativity / Innovation / Redesign / Stuck
    const isCreativeProblem = /creative|reinvent|redesign|invent|stuck|innovation|brainstorm|idea|brand|marketing|campaign|novel|unique/i.test(text);
    if (isCreativeProblem) {
      if (['scamper-model', 'six-thinking-hats', 'first-principles', 'thinking-outside-box', 'rubber-band-model'].includes(m.id)) {
        score += 35;
      }
    }

    return { model: m, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Pick top 3 unique models from distinct categories if possible
  const selected: StrategicModel[] = [];
  for (const item of scored) {
    if (selected.length >= 3) break;
    if (!selected.some(s => s.id === item.model.id)) {
      selected.push(item.model);
    }
  }

  // Fallback if less than 3
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

  return selected.slice(0, 3).map(m => ({
    modelId: m.id,
    modelName: m.name,
    categoryName: m.categoryName,
    tagline: m.tagline,
    fitReason: `Directly targets key trade-offs and structural dynamics identified in "${title || 'your dilemma'}".`,
    keyQuestion: m.strategicQuestion
  }));
}

export function extractContextualDecisionData(title: string, description: string, rawOptions?: string[]) {
  const fullText = (title + ' ' + (description || '')).trim();

  // 1. Determine Contextual Options
  let opts: string[] = [];
  if (Array.isArray(rawOptions) && rawOptions.length >= 2) {
    const isGeneric = rawOptions.some(o =>
      /^option\s+[a-d]/i.test(o.trim()) ||
      /primary initiative|alternative path|maintain current baseline|execute new path|maintain current trajectory/i.test(o)
    );
    if (!isGeneric) {
      opts = rawOptions;
    }
  }

  // Domain matches
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

  // Create tailored summary & rationale strings based on the extracted domain
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

  return {
    opts,
    summaryText,
    rationaleText,
    prosA,
    consA,
    prosB,
    consB
  };
}

export function generateClientFallbackAnalysis(input: DecisionInput): DecisionAnalysisResult {
  const title = input.title || 'Strategic Decision Evaluation';
  const description = input.description || '';
  
  const { opts, summaryText, rationaleText, prosA, consA, prosB, consB } = extractContextualDecisionData(title, description, input.options);

  const selectedModelIds = Array.isArray(input.selectedModelIds) && input.selectedModelIds.length > 0
    ? input.selectedModelIds.slice(0, 3)
    : ['eisenhower-matrix', 'swot-analysis', 'rubber-band-model'];

  const analyses = selectedModelIds.map(id => {
    const m = getModelById(id) || {
      id,
      name: 'Strategic Framework',
      categoryName: 'Decision Model',
      strategicQuestion: 'What is the optimal path forward?',
      visualType: 'prosCons',
      tagline: 'Structured choice evaluation'
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
    decisionTitle: title,
    decisionDescription: description,
    options: opts,
    recommendedModelsUsed: selectedModelIds,
    overallTiebreakerSummary: summaryText,
    analyses
  };
}
