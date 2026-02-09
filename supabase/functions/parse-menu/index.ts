import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

interface ParsedMenu {
  restaurantName: string | null;
  restaurantType: 'chain' | 'independent';
  items: MenuItem[];
}

interface UserProfile {
  dailyCalorieTarget: number;
  remainingCalories: number;
  dietType: string;
  macroPriority: string;
  intolerances: string[];
  dislikes: string[];
}

// Score each item 0-100
function scoreItem(item: MenuItem, profile: UserProfile): number {
  let score = 50;

  // Calorie fit (biggest factor)
  if (item.estimatedCalories <= profile.remainingCalories * 0.5) score += 25;
  else if (item.estimatedCalories <= profile.remainingCalories * 0.7) score += 15;
  else if (item.estimatedCalories > profile.remainingCalories) score -= 20;

  // Macro alignment
  if (profile.macroPriority === 'highprotein' && item.estimatedProtein > 30) score += 15;
  if (profile.macroPriority === 'lowcarb' && item.estimatedCarbs < 30) score += 15;
  if (profile.macroPriority === 'lowcal' && item.estimatedCalories < 500) score += 15;

  // Diet compliance
  if (profile.dietType === 'keto' && item.estimatedCarbs > 20) score -= 30;
  if (profile.dietType === 'vegan' && !item.isVegan) score = -100;
  if (profile.dietType === 'lowcarb' && item.estimatedCarbs > 50) score -= 20;

  // Intolerances (hard filter)
  const itemIngredients = item.ingredients.map(i => i.toLowerCase()).join(' ');
  for (const intolerance of profile.intolerances) {
    if (itemIngredients.includes(intolerance.toLowerCase())) {
      score = -100;
      break;
    }
  }

  // Dislikes (soft filter)
  for (const dislike of profile.dislikes) {
    if (itemIngredients.includes(dislike.toLowerCase()) || 
        item.name.toLowerCase().includes(dislike.toLowerCase())) {
      score -= 25;
    }
  }

  return Math.max(-100, Math.min(100, score));
}

function getTrafficLight(score: number): 'green' | 'amber' | 'red' {
  if (score >= 40) return 'green';
  if (score >= 10) return 'amber';
  return 'red';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageUrl, userProfile } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'imageUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

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
            content: `You are a menu parser. Extract all menu items from this restaurant menu photo.
Return JSON with this exact structure:
{
  "restaurantName": string | null,
  "restaurantType": "chain" | "independent",
  "items": [
    {
      "name": string,
      "description": string | null,
      "price": string | null,
      "section": string | null (e.g., "Appetizers", "Mains", "Desserts"),
      "estimatedCalories": number,
      "estimatedProtein": number (grams),
      "estimatedCarbs": number (grams),
      "estimatedFat": number (grams),
      "ingredients": string[] (main ingredients),
      "isVegetarian": boolean,
      "isVegan": boolean,
      "isGlutenFree": boolean
    }
  ]
}

For each item, estimate nutrition based on typical restaurant portions.
If you recognize a chain restaurant, note it. Be conservative with calorie estimates (restaurant portions are usually larger than expected).
Only return valid JSON, no markdown or extra text.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              },
              {
                type: 'text',
                text: 'Parse this menu and extract all items with nutrition estimates.'
              }
            ]
          }
        ],
        max_tokens: 4096,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let parsedMenu: ParsedMenu;
    try {
      // Remove markdown code blocks if present
      const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedMenu = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse menu data');
    }

    // If user profile provided, score and rank items
    let scoredItems = parsedMenu.items.map(item => ({
      ...item,
      score: 50,
      trafficLight: 'amber' as const,
    }));

    if (userProfile) {
      scoredItems = parsedMenu.items.map(item => {
        const score = scoreItem(item, userProfile);
        return {
          ...item,
          score,
          trafficLight: getTrafficLight(score),
        };
      });

      // Sort by score descending
      scoredItems.sort((a, b) => b.score - a.score);
    }

    // Get top 3 picks
    const topPicks = scoredItems
      .filter(item => item.score > 0)
      .slice(0, 3)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        badge: index === 0 ? 'Best Overall' : 
               index === 1 ? (userProfile?.macroPriority === 'highprotein' ? 'Highest Protein' : 'Runner Up') :
               'Best with Mods',
      }));

    return new Response(
      JSON.stringify({
        success: true,
        restaurantName: parsedMenu.restaurantName,
        restaurantType: parsedMenu.restaurantType,
        items: scoredItems,
        topPicks,
        totalItems: scoredItems.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
