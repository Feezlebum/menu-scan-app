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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',  // 🚀 SPEED OPTIMIZATION: Switch to faster model
        messages: [
          {
            role: 'system',
            content: `Extract orderable dishes from menu for user: Goal=${goal}, Diet=${dietType}, Priority=${macroPriority}, Avoid=${intolerances.join(',')}.

Rules:
- Combine styles+proteins: "Garlic Chicken" not "Garlic"
- Include default sides in nutrition (rice adds ~200cal, 45g carbs)
- Prices: numeric only ("12.95"), null if missing/MP
- Personalize tips for ${goal} goal${dietType !== 'none' ? ` and ${dietType} diet` : ''}

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

Return valid JSON only.`
          },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageUrl } },
              { type: 'text', text: 'Parse this menu. Create complete dish names (style+protein). Include sides in nutrition estimates.' }
            ]
          }
        ],
        max_tokens: 2048,  // 🚀 SPEED OPTIMIZATION: Reduce token limit 
        temperature: 0.3,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI error: ${await response.text()}`);
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
    const parsedMenu = JSON.parse(jsonStr);

    const profile: UserProfile = userProfile || {
      goal: 'health',
      dietType: 'none',
      macroPriority: 'balanced',
      intolerances: [],
      dislikes: [],
    };

    const scoredItems = parsedMenu.items.map((item: MenuItem) => {
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
      restaurantName: parsedMenu.restaurantName,
      restaurantType: parsedMenu.restaurantType,
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