import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NutritionEstimate {
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  health: 'healthy' | 'moderate' | 'indulgent';
  healthReason: string;
  score: number;
  trafficLight: 'green' | 'amber' | 'red';
  matchLabel: string;
}

function safeJson<T>(value: string): T {
  const cleaned = value.replace(/```json\n?|\n?```/g, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }
    throw new Error('Invalid JSON payload from model');
  }
}

function normalizeEstimate(estimate: NutritionEstimate): NutritionEstimate {
  const calories = Math.max(50, Math.min(2500, Math.round(estimate.estimatedCalories || 0)));
  const protein = Math.max(0, Math.min(250, Math.round(estimate.estimatedProtein || 0)));
  const carbs = Math.max(0, Math.min(350, Math.round(estimate.estimatedCarbs || 0)));
  const fat = Math.max(0, Math.min(180, Math.round(estimate.estimatedFat || 0)));

  const score = Math.max(0, Math.min(100, Math.round(estimate.score || 0)));
  const trafficLight = score >= 70 ? 'green' : score >= 40 ? 'amber' : 'red';
  const health = score >= 72 ? 'healthy' : score >= 50 ? 'moderate' : 'indulgent';
  const matchLabel =
    score >= 85
      ? 'Perfect Match'
      : score >= 70
      ? 'Great Choice'
      : score >= 55
      ? 'Good Option'
      : score >= 40
      ? 'Okay with Tweaks'
      : 'Splurge';

  return {
    estimatedCalories: calories,
    estimatedProtein: protein,
    estimatedCarbs: carbs,
    estimatedFat: fat,
    score,
    health,
    trafficLight,
    matchLabel,
    healthReason:
      estimate.healthReason ||
      (health === 'healthy'
        ? 'Balanced estimate with good protein and manageable calories.'
        : health === 'moderate'
        ? 'Reasonable choice, but portion and sides can swing calories up.'
        : 'Likely calorie-dense choice; consider lighter sides or portion split.'),
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('Missing OPENAI_API_KEY');
    }

    const body = await req.json();
    const itemName = (body?.itemName || '').toString().trim();
    const cuisineKey = (body?.cuisineKey || 'other').toString().trim();
    const restaurantName = (body?.restaurantName || '').toString().trim();

    if (!itemName) {
      throw new Error('itemName is required');
    }

    const prompt = `Estimate nutrition for a restaurant menu item.
Return ONLY strict JSON with keys:
estimatedCalories, estimatedProtein, estimatedCarbs, estimatedFat, health, healthReason, score, trafficLight, matchLabel.

Context:
- Item name: ${itemName}
- Cuisine: ${cuisineKey}
- Restaurant: ${restaurantName || 'unknown'}

Rules:
- Give realistic single-serving estimates.
- Protein/carbs/fat in grams.
- score must be 0-100.
- health must be one of: healthy, moderate, indulgent.
- trafficLight must be one of: green, amber, red.
- matchLabel should match score meaning.
- Keep healthReason short (1 sentence).
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You output strict JSON only.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI error: ${response.status} ${text}`);
    }

    const completion = await response.json();
    const content = completion?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from model');
    }

    const parsed = safeJson<NutritionEstimate>(content);
    const estimate = normalizeEstimate(parsed);

    return new Response(
      JSON.stringify({ success: true, estimate }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
