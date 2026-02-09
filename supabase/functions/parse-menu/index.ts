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
  dailyCalorieTarget: number;
  remainingCalories: number;
  dietType: string;
  macroPriority: string;
  intolerances: string[];
  dislikes: string[];
}

// Score each item 0-100 based on user profile
function scoreItem(item: MenuItem, profile: UserProfile): { score: number; reasons: string[] } {
  let score = 50;
  const reasons: string[] = [];

  // === CALORIE DENSITY (lower = better for weight loss) ===
  if (item.estimatedCalories <= 400) {
    score += 20;
    reasons.push('Low calorie option');
  } else if (item.estimatedCalories <= 600) {
    score += 10;
    reasons.push('Moderate calories');
  } else if (item.estimatedCalories > 900) {
    score -= 10;
    reasons.push('High calorie dish');
  }

  // === MACRO ALIGNMENT ===
  if (profile.macroPriority === 'highprotein') {
    if (item.estimatedProtein >= 40) {
      score += 20;
      reasons.push(`High protein (${item.estimatedProtein}g)`);
    } else if (item.estimatedProtein >= 30) {
      score += 12;
      reasons.push(`Good protein (${item.estimatedProtein}g)`);
    } else if (item.estimatedProtein < 15) {
      score -= 10;
    }
  }
  
  if (profile.macroPriority === 'lowcarb') {
    if (item.estimatedCarbs <= 20) {
      score += 20;
      reasons.push(`Low carb (${item.estimatedCarbs}g)`);
    } else if (item.estimatedCarbs <= 35) {
      score += 10;
    } else if (item.estimatedCarbs > 60) {
      score -= 15;
      reasons.push('High carb content');
    }
  }
  
  if (profile.macroPriority === 'lowcal') {
    if (item.estimatedCalories <= 400) {
      score += 20;
      reasons.push('Low calorie option');
    } else if (item.estimatedCalories <= 550) {
      score += 10;
    } else if (item.estimatedCalories > 800) {
      score -= 10;
    }
  }

  // === DIET COMPLIANCE ===
  if (profile.dietType === 'keto') {
    if (item.estimatedCarbs <= 10) {
      score += 15;
      reasons.push('Keto-friendly');
    } else if (item.estimatedCarbs <= 20) {
      score += 5;
    } else if (item.estimatedCarbs > 30) {
      score -= 25;
      reasons.push('Too many carbs for keto');
    }
  }
  
  if (profile.dietType === 'vegan') {
    if (item.isVegan) {
      score += 15;
      reasons.push('Vegan');
    } else {
      score = -100; // Hard filter
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
  }

  // === INTOLERANCES (hard filter) ===
  const itemText = [
    item.name,
    item.description || '',
    ...item.ingredients
  ].join(' ').toLowerCase();
  
  for (const intolerance of profile.intolerances) {
    const intoleranceLower = intolerance.toLowerCase();
    // Check for common variations
    const variations = [intoleranceLower];
    if (intoleranceLower === 'dairy') variations.push('milk', 'cheese', 'cream', 'butter');
    if (intoleranceLower === 'gluten') variations.push('wheat', 'bread', 'flour', 'pasta');
    if (intoleranceLower === 'nuts') variations.push('peanut', 'almond', 'walnut', 'cashew');
    
    for (const v of variations) {
      if (itemText.includes(v)) {
        score = -100;
        reasons.push(`Contains ${intolerance}`);
        break;
      }
    }
  }

  // === DISLIKES (soft filter) ===
  for (const dislike of profile.dislikes) {
    if (itemText.includes(dislike.toLowerCase())) {
      score -= 30;
      reasons.push(`Contains ${dislike}`);
    }
  }

  // === BONUS: Protein-to-calorie ratio ===
  const proteinRatio = item.estimatedProtein / (item.estimatedCalories / 100);
  if (proteinRatio > 5 && profile.macroPriority !== 'lowcarb') {
    score += 5;
    reasons.push('Great protein-to-calorie ratio');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons: reasons.slice(0, 3), // Top 3 reasons only
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

    // Build user context for personalized AI response
    const userContext = userProfile ? `
USER PROFILE (personalize your analysis for this person):
- Goal: ${userProfile.goal || 'general health'}
- Diet type: ${userProfile.dietType || 'no specific diet'}
- Macro priority: ${userProfile.macroPriority || 'balanced'} ${userProfile.macroPriority === 'highprotein' ? '(wants high protein options)' : userProfile.macroPriority === 'lowcarb' ? '(avoiding carbs)' : userProfile.macroPriority === 'lowcal' ? '(wants lowest calorie options)' : ''}
- Food allergies/intolerances: ${userProfile.intolerances?.length > 0 ? userProfile.intolerances.join(', ') : 'none'}
- Foods they dislike: ${userProfile.dislikes?.length > 0 ? userProfile.dislikes.join(', ') : 'none'}

PERSONALIZATION RULES:
- Flag any items containing their allergens/intolerances in the ingredients
- Tailor modification tips to their specific goals (e.g., if high-protein priority, suggest adding protein)
- If they're low-carb/keto, suggest carb swaps (no bun, lettuce wrap, etc.)
- For weight loss goals, prioritize lower calorie options
` : '';

    // Call GPT-4o to parse the menu
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
Extract ALL menu items from the restaurant menu photo.

Return JSON with this exact structure:
{
  "restaurantName": string | null,
  "restaurantType": "chain" | "independent",
  "items": [
    {
      "name": string,
      "description": string | null,
      "price": string | null,
      "section": string | null (e.g., "Appetizers", "Mains", "Salads"),
      "estimatedCalories": number,
      "estimatedProtein": number (grams),
      "estimatedCarbs": number (grams),
      "estimatedFat": number (grams),
      "ingredients": string[] (main ingredients you can identify or infer),
      "isVegetarian": boolean,
      "isVegan": boolean,
      "isGlutenFree": boolean,
      "allergenWarning": string | null (if this item contains user's allergens, explain here),
      "modificationTips": string[] (2-3 ways to make it healthier FOR THIS SPECIFIC USER based on their goals)
    }
  ]
}

IMPORTANT:
- Estimate nutrition based on TYPICAL RESTAURANT PORTIONS (usually larger than home cooking)
- Be conservative — restaurants use more oil, butter, and larger portions than expected
- Modification tips should be PERSONALIZED to the user's goals and restrictions
- If you recognize a chain restaurant, use your knowledge of their actual nutrition data
- If an item contains the user's allergens, set allergenWarning to explain (e.g., "Contains dairy")
- Only return valid JSON, no markdown or extra text.`
          },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageUrl } },
              { type: 'text', text: 'Parse this menu and extract all items with personalized nutrition estimates and modification tips for my goals.' }
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

    // Parse the JSON response
    const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
    const parsedMenu = JSON.parse(jsonStr);

    // Default profile if none provided
    const profile: UserProfile = userProfile || {
      dailyCalorieTarget: 2000,
      remainingCalories: 2000,
      dietType: 'none',
      macroPriority: 'balanced',
      intolerances: [],
      dislikes: [],
    };

    // Score each item
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

    // Sort by score descending
    scoredItems.sort((a: any, b: any) => b.score - a.score);

    // Get top 3 picks (score > 40)
    const topPicks = scoredItems
      .filter((item: any) => item.score >= 40)
      .slice(0, 3)
      .map((item: any, index: number) => ({
        ...item,
        rank: index + 1,
        badge: index === 0 ? 'Best Match' : 
               index === 1 ? 'Runner Up' :
               'Great Option',
      }));

    return new Response(JSON.stringify({
      success: true,
      restaurantName: parsedMenu.restaurantName,
      restaurantType: parsedMenu.restaurantType,
      items: scoredItems,
      topPicks,
      totalItems: scoredItems.length,
      userCaloriesRemaining: profile.remainingCalories,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
