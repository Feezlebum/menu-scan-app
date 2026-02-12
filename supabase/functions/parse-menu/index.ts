import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MenuItem {
  name: string;
  description: string | null;
  price: string | null;
  section: string | null;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  ingredients: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
}

interface UserProfile {
  goal: string;
  dietType: string;
  macroPriority: string;
  intolerances: string[];
  dislikes: string[];
}

function scoreItem(item: MenuItem, profile: UserProfile): { score: number; reasons: string[] } {
  let score = 50;
  const reasons: string[] = [];

  const caloriesPerServing = item.estimatedCalories;
  if (caloriesPerServing <= 350) {
    score += 25;
    reasons.push('Light option');
  } else if (caloriesPerServing <= 500) {
    score += 15;
    reasons.push('Moderate calories');
  } else if (caloriesPerServing <= 700) {
    score += 5;
  } else if (caloriesPerServing > 900) {
    score -= 15;
    reasons.push('High calorie dish');
  }

  if (profile.macroPriority === 'highprotein') {
    const proteinRatio = item.estimatedProtein / (item.estimatedCalories / 100);
    if (item.estimatedProtein >= 40) {
      score += 20;
      reasons.push(`High protein (${item.estimatedProtein}g)`);
    } else if (item.estimatedProtein >= 30) {
      score += 12;
      reasons.push(`Good protein (${item.estimatedProtein}g)`);
    } else if (item.estimatedProtein >= 20) {
      score += 5;
    } else if (item.estimatedProtein < 15) {
      score -= 10;
    }
    if (proteinRatio > 6) {
      score += 5;
      reasons.push('Great protein density');
    }
  }
  
  if (profile.macroPriority === 'lowcarb') {
    if (item.estimatedCarbs <= 15) {
      score += 25;
      reasons.push(`Very low carb (${item.estimatedCarbs}g)`);
    } else if (item.estimatedCarbs <= 30) {
      score += 15;
      reasons.push(`Low carb (${item.estimatedCarbs}g)`);
    } else if (item.estimatedCarbs <= 45) {
      score += 5;
    } else if (item.estimatedCarbs > 60) {
      score -= 20;
      reasons.push('High carb content');
    }
  }
  
  if (profile.macroPriority === 'lowcal') {
    if (caloriesPerServing <= 300) {
      score += 25;
      reasons.push('Very low calorie');
    } else if (caloriesPerServing <= 450) {
      score += 15;
      reasons.push('Low calorie option');
    } else if (caloriesPerServing <= 600) {
      score += 5;
    } else if (caloriesPerServing > 800) {
      score -= 15;
    }
  }

  if (profile.dietType === 'keto') {
    if (item.estimatedCarbs <= 8) {
      score += 20;
      reasons.push('Keto-friendly');
    } else if (item.estimatedCarbs <= 15) {
      score += 10;
      reasons.push('Low carb');
    } else if (item.estimatedCarbs > 25) {
      score -= 30;
      reasons.push('Too many carbs for keto');
    }
  }
  
  if (profile.dietType === 'vegan') {
    if (item.isVegan) {
      score += 15;
      reasons.push('Vegan');
    } else {
      score = -100;
      reasons.push('Not vegan');
    }
  }
  
  if (profile.dietType === 'vegetarian') {
    if (item.isVegetarian) {
      score += 10;
      reasons.push('Vegetarian');
    } else {
      score = -100;
      reasons.push('Contains meat');
    }
  }
  
  if (profile.dietType === 'lowcarb' && item.estimatedCarbs > 50) {
    score -= 20;
    reasons.push('High carbs');
  }

  if (profile.dietType === 'mediterranean') {
    const itemText = [item.name, item.description || '', ...item.ingredients].join(' ').toLowerCase();
    if (itemText.match(/fish|salmon|tuna|shrimp|seafood|olive|vegetable|salad|grilled/)) {
      score += 10;
      reasons.push('Mediterranean-style');
    }
  }

  const itemText = [item.name, item.description || '', ...item.ingredients].join(' ').toLowerCase();
  
  for (const intolerance of profile.intolerances) {
    const intoleranceLower = intolerance.toLowerCase();
    const variations = [intoleranceLower];
    if (intoleranceLower === 'dairy') variations.push('milk', 'cheese', 'cream', 'butter', 'yogurt');
    if (intoleranceLower === 'gluten') variations.push('wheat', 'bread', 'flour', 'pasta', 'breaded');
    if (intoleranceLower === 'nuts') variations.push('peanut', 'almond', 'walnut', 'cashew', 'pecan');
    if (intoleranceLower === 'shellfish') variations.push('shrimp', 'crab', 'lobster', 'oyster', 'mussel');
    if (intoleranceLower === 'soy') variations.push('tofu', 'edamame', 'soya');
    if (intoleranceLower === 'eggs') variations.push('egg', 'mayonnaise', 'mayo');
    
    for (const v of variations) {
      if (itemText.includes(v)) {
        score = -100;
        reasons.push(`Contains ${intolerance}`);
        break;
      }
    }
  }

  for (const dislike of profile.dislikes) {
    if (itemText.includes(dislike.toLowerCase())) {
      score -= 30;
      reasons.push(`Contains ${dislike}`);
    }
  }

  if (profile.goal === 'lose') {
    if (caloriesPerServing <= 400) score += 5;
    if (caloriesPerServing > 800) score -= 5;
  }
  
  if (profile.goal === 'gain') {
    if (item.estimatedProtein >= 35 && caloriesPerServing >= 500) {
      score += 10;
      reasons.push('Good for gains');
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons: reasons.slice(0, 3),
  };
}

function getTrafficLight(score: number): 'green' | 'amber' | 'red' {
  if (score >= 70) return 'green';
  if (score >= 40) return 'amber';
  return 'red';
}

function getMatchLabel(score: number): string {
  if (score >= 85) return 'Perfect Match';
  if (score >= 70) return 'Great Choice';
  if (score >= 55) return 'Good Option';
  if (score >= 40) return 'Okay with Tweaks';
  if (score >= 20) return 'Occasional Treat';
  return 'Splurge';
}

function safeParseJson(content: string): any {
  const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
  try {
    return JSON.parse(jsonStr);
  } catch {
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(jsonStr.slice(start, end + 1));
    }
    throw new Error('Failed to parse model JSON output');
  }
}

function normalizeNutrition(items: MenuItem[]): MenuItem[] {
  return items.map((item) => {
    const name = `${item.name} ${item.description || ''}`.toLowerCase();

    let calories = Math.max(80, Math.min(2200, Math.round(item.estimatedCalories || 0)));
    let protein = Math.max(0, Math.min(180, Math.round(item.estimatedProtein || 0)));
    let carbs = Math.max(0, Math.min(280, Math.round(item.estimatedCarbs || 0)));
    let fat = Math.max(0, Math.min(150, Math.round(item.estimatedFat || 0)));

    // Keep basic macro-to-calorie consistency.
    const macroCalories = protein * 4 + carbs * 4 + fat * 9;
    if (macroCalories > 0 && Math.abs(macroCalories - calories) / Math.max(calories, 1) > 0.45) {
      calories = Math.round((calories + macroCalories) / 2);
    }

    // Ingredient-based sanity for hotdogs and loaded variants.
    if (name.includes('hot dog') || name.includes('hotdog')) {
      calories = Math.max(calories, 320);
      if (name.includes('cheese') || name.includes('chili') || name.includes('bacon')) {
        calories = Math.max(calories, 420);
        fat = Math.max(fat, 20);
      }
    }

    return {
      ...item,
      estimatedCalories: calories,
      estimatedProtein: protein,
      estimatedCarbs: carbs,
      estimatedFat: fat,
    };
  });
}

async function callOpenAI(openaiKey: string, imageUrl: string, systemPrompt: string, userPrompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            { type: 'text', text: userPrompt },
          ],
        },
      ],
      max_tokens: 3200,
      temperature: 0.1,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI error: ${await response.text()}`);

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('No response from OpenAI');
  return safeParseJson(content);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageUrl, userProfile } = await req.json();

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'imageUrl is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) throw new Error('OPENAI_API_KEY not configured');

    // Build concise user context
    const goal = userProfile?.goal || 'general health';
    const dietType = userProfile?.dietType || 'none';
    const macroPriority = userProfile?.macroPriority || 'balanced';
    const intolerances = userProfile?.intolerances || [];
    const dislikes = userProfile?.dislikes || [];

    const systemPrompt = `Extract orderable dishes from menu for user: Goal=${goal}, Diet=${dietType}, Priority=${macroPriority}, Avoid=${intolerances.join(',')}.

Critical rules:
- Capture ALL menu sections and all visible orderable items (apps, mains, sides, drinks, desserts).
- Combine styles+proteins: "Garlic Chicken" not "Garlic".
- Include default sides in nutrition (rice adds ~200cal, ~45g carbs).
- Prices must be numeric strings ("12.95"), null if missing/MP.
- Be internally consistent: upgraded variants (e.g., cheese/chili/bacon) should not have fewer calories than plain versions.
- Personalize tips for ${goal} goal${dietType !== 'none' ? ` and ${dietType} diet` : ''}.

JSON format:
{
  "restaurantName": string|null,
  "restaurantType": "chain"|"independent",
  "items": [{
    "name": string,
    "description": string|null,
    "price": string|null,
    "section": string|null,
    "estimatedCalories": number,
    "estimatedProtein": number,
    "estimatedCarbs": number,
    "estimatedFat": number,
    "ingredients": string[],
    "isVegetarian": boolean,
    "isVegan": boolean,
    "isGlutenFree": boolean,
    "allergenWarning": string|null,
    "modificationTips": string[]
  }]
}

Return valid JSON only.`;

    let parsedMenu = await callOpenAI(
      openaiKey,
      imageUrl,
      systemPrompt,
      'Parse this menu completely. Extract every visible orderable item and estimate nutrition.'
    );

    if (!Array.isArray(parsedMenu?.items) || parsedMenu.items.length < 3) {
      // Reliability retry pass
      parsedMenu = await callOpenAI(
        openaiKey,
        imageUrl,
        systemPrompt,
        'Retry carefully. The first pass was incomplete. Re-read the menu and extract every visible item across all sections.'
      );
    }

    const profile: UserProfile = userProfile || {
      goal: 'health',
      dietType: 'none',
      macroPriority: 'balanced',
      intolerances: [],
      dislikes: [],
    };

    const rawItems: MenuItem[] = Array.isArray(parsedMenu?.items) ? parsedMenu.items : [];
    if (rawItems.length === 0) {
      throw new Error('No menu items detected. Please retake the photo with the full menu in frame.');
    }

    const normalizedItems = normalizeNutrition(rawItems);

    const scoredItems = normalizedItems.map((item: MenuItem) => {
      const { score, reasons } = scoreItem(item, profile);
      return {
        ...item,
        score,
        scoreReasons: reasons,
        trafficLight: getTrafficLight(score),
        matchLabel: getMatchLabel(score),
      };
    });

    scoredItems.sort((a: any, b: any) => b.score - a.score);

    const topPicks = scoredItems
      .filter((item: any) => item.score >= 40)
      .slice(0, 3)
      .map((item: any, index: number) => ({
        ...item,
        rank: index + 1,
        badge: index === 0 ? 'Best Match' : index === 1 ? 'Runner Up' : 'Great Option',
      }));

    return new Response(JSON.stringify({
      success: true,
      restaurantName: parsedMenu?.restaurantName ?? null,
      restaurantType: parsedMenu?.restaurantType === 'chain' ? 'chain' : 'independent',
      items: scoredItems,
      topPicks,
      totalItems: scoredItems.length,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});