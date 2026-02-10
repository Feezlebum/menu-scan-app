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

    const userContext = userProfile ? `
USER PROFILE (personalize your analysis for this person):
- Goal: ${userProfile.goal || 'general health'}
- Diet type: ${userProfile.dietType || 'no specific diet'}
- Macro priority: ${userProfile.macroPriority || 'balanced'} ${userProfile.macroPriority === 'highprotein' ? '(wants high protein options)' : userProfile.macroPriority === 'lowcarb' ? '(avoiding carbs)' : userProfile.macroPriority === 'lowcal' ? '(wants lowest calorie options)' : ''}
- Food allergies/intolerances: ${userProfile.intolerances?.length > 0 ? userProfile.intolerances.join(', ') : 'none'}
- Foods they dislike: ${userProfile.dislikes?.length > 0 ? userProfile.dislikes.join(', ') : 'none'}

PERSONALIZATION RULES:
- Flag any items containing their allergens/intolerances
- Tailor modification tips to their specific goals
- If they're low-carb/keto, suggest carb swaps
- For weight loss goals, prioritize lower calorie density options
` : '';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert nutritionist and menu analyzer helping someone make healthy choices when eating out.
${userContext}
Extract ALL orderable dishes from the restaurant menu photo.

CRITICAL PARSING RULES:
1. **"Choose Your Protein" menus**: Many Asian restaurants list dish STYLES (e.g., "Garlic", "Ginger", "Cashew Nut") separately from PROTEIN choices (Chicken, Beef, Shrimp, etc.). 
   - These are NOT standalone dishes - they are preparation styles
   - Create COMPLETE dish names by combining: "[Style] [Protein]" (e.g., "Garlic Chicken", "Ginger Beef", "Cashew Nut Shrimp")
   - Use the CHICKEN version as the default representative dish for each style (most commonly ordered)
   - Include the price for chicken in the price field
   - Mention in description that other proteins are available

2. **Include default sides**: If the menu says "served with rice" or similar, INCLUDE the rice/side in your nutrition estimates

3. **Don't list sauce names or ingredients as dishes**: "Garlic", "Ginger", "Basil" alone are NOT dishes - they describe a preparation style

4. **Soups with protein choices**: Same rule - create representative dishes like "Tom Yum Soup with Chicken"

5. **Price extraction rules**:
   - Extract a price for each dish when visible
   - Return `price` as a numeric string only (e.g., "12.95", never "$12.95")
   - If a dish has multiple prices/sizes, use the smallest/first listed price
   - If price is listed as "Market Price", "MP", or not shown, set `price` to null
   - For text like "Starting at $15", return "15.00"

Return JSON with this exact structure:
{
  "restaurantName": string | null,
  "restaurantType": "chain" | "independent",
  "items": [
    {
      "name": string (FULL dish name a customer would order, e.g., "Garlic Chicken" not just "Garlic"),
      "description": string | null (include "Other proteins available: Beef, Shrimp, etc." if applicable),
      "price": string | null (use chicken/default price if multiple options),
      "section": string | null (e.g., "Entrees", "Soups", "Salads"),
      "estimatedCalories": number (INCLUDE any default sides like rice),
      "estimatedProtein": number (grams),
      "estimatedCarbs": number (grams - INCLUDE rice if served with),
      "estimatedFat": number (grams),
      "ingredients": string[] (main ingredients),
      "isVegetarian": boolean,
      "isVegan": boolean,
      "isGlutenFree": boolean,
      "allergenWarning": string | null,
      "modificationTips": string[] (2-3 personalized tips)
    }
  ]
}

IMPORTANT:
- Estimate nutrition for TYPICAL RESTAURANT PORTIONS (larger than home cooking)
- Be conservative — restaurants use more oil, butter, and larger portions
- If dish is served with rice, add ~200 cal and ~45g carbs for the rice
- If you recognize a chain restaurant, use your knowledge of their actual nutrition data
- Only return valid JSON, no markdown or extra text.`
          },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageUrl } },
              { type: 'text', text: 'Parse this menu and extract all ORDERABLE dishes with complete names. Remember: if there are "choose your protein" sections, combine the style + protein into proper dish names.' }
            ]
          }
        ],
        max_tokens: 4096,
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
