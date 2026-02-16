import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Confidence = 'low' | 'medium' | 'high';
type PortionAssessment = 'smaller' | 'as_expected' | 'larger' | 'much_larger';

interface VerifyResult {
  revisedCalories: number;
  revisedProtein: number;
  revisedCarbs: number;
  revisedFat: number;
  confidence: Confidence;
  notes: string;
  portionAssessment: PortionAssessment;
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

function normalizeResult(result: VerifyResult): VerifyResult {
  return {
    revisedCalories: Math.max(50, Math.min(3000, Math.round(result.revisedCalories || 0))),
    revisedProtein: Math.max(0, Math.min(300, Math.round(result.revisedProtein || 0))),
    revisedCarbs: Math.max(0, Math.min(400, Math.round(result.revisedCarbs || 0))),
    revisedFat: Math.max(0, Math.min(220, Math.round(result.revisedFat || 0))),
    confidence: ['low', 'medium', 'high'].includes(result.confidence) ? result.confidence : 'medium',
    notes: (result.notes || '').toString().slice(0, 400),
    portionAssessment: ['smaller', 'as_expected', 'larger', 'much_larger'].includes(result.portionAssessment)
      ? result.portionAssessment
      : 'as_expected',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');

    const body = await req.json();
    const imageUrl = (body?.imageUrl || '').toString().trim();
    const itemName = (body?.context?.itemName || '').toString().trim();
    const restaurantName = (body?.context?.restaurantName || '').toString().trim();
    const est = body?.context?.menuEstimate || {};

    if (!imageUrl) throw new Error('imageUrl is required');
    if (!itemName) throw new Error('context.itemName is required');

    const prompt = `You are a nutrition estimation AI.\n\nUser ordered: ${itemName}\nRestaurant: ${restaurantName || 'unknown'}\nMenu estimate:\n- Calories: ${Math.round(est.calories || 0)}\n- Protein: ${Math.round(est.protein || 0)}g\n- Carbs: ${Math.round(est.carbs || 0)}g\n- Fat: ${Math.round(est.fat || 0)}g\n\nAnalyze the plate photo and provide revised estimates based on visible portion size and ingredients.\n\nReturn ONLY strict JSON with keys:\nrevisedCalories, revisedProtein, revisedCarbs, revisedFat, confidence, notes, portionAssessment\n\nconfidence must be one of: low, medium, high\nportionAssessment must be one of: smaller, as_expected, larger, much_larger`;

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
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI error: ${response.status} ${text}`);
    }

    const completion = await response.json();
    const content = completion?.choices?.[0]?.message?.content;
    if (!content) throw new Error('No response content from model');

    const parsed = safeJson<VerifyResult>(content);
    const result = normalizeResult(parsed);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
