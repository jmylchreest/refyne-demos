// Refyne API integration for recipe extraction

export interface ExtractedRecipe {
  title: string;
  description?: string;
  image_url?: string;
  prep_time?: string;
  cook_time?: string;
  total_time?: string;
  servings?: number;
  ingredients: {
    name: string;
    quantity?: string;
    unit?: string;
    notes?: string;
  }[];
  instructions: {
    step: number;
    text: string;
  }[];
  nutrition?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
  tags?: string[];
}

export interface RefyneResponse {
  success: boolean;
  data?: ExtractedRecipe;
  error?: string;
}

// Recipe extraction schema for Refyne
const RECIPE_SCHEMA = `
name: Recipe
description: Extract recipe details from a webpage

fields:
  - name: title
    type: string
    required: true
    description: The recipe name or title

  - name: description
    type: string
    description: Brief description or intro paragraph

  - name: image_url
    type: string
    description: URL of the main recipe image

  - name: prep_time
    type: string
    description: Preparation time (e.g., "15 minutes")

  - name: cook_time
    type: string
    description: Cooking time (e.g., "30 minutes")

  - name: total_time
    type: string
    description: Total time (e.g., "45 minutes")

  - name: servings
    type: integer
    description: Number of servings

  - name: ingredients
    type: array
    description: List of ingredients
    items:
      type: object
      properties:
        name:
          type: string
          required: true
          description: Ingredient name
        quantity:
          type: string
          description: Amount (e.g., "2", "1/2")
        unit:
          type: string
          description: Unit of measure (e.g., "cups", "tbsp")
        notes:
          type: string
          description: Preparation notes (e.g., "diced", "softened")

  - name: instructions
    type: array
    description: Step-by-step instructions
    items:
      type: object
      properties:
        step:
          type: integer
          description: Step number
        text:
          type: string
          required: true
          description: Instruction text

  - name: nutrition
    type: object
    description: Nutritional information per serving
    properties:
      calories:
        type: string
      protein:
        type: string
      carbs:
        type: string
      fat:
        type: string

  - name: tags
    type: array
    description: Recipe categories or tags
    items:
      type: string
`;

export async function extractRecipe(
  url: string,
  apiUrl: string,
  apiKey: string
): Promise<RefyneResponse> {
  try {
    const response = await fetch(`${apiUrl}/api/v1/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        schema: RECIPE_SCHEMA,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `API error: ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error,
      };
    }

    // Extract the recipe data from the response
    const extracted = data.data || data;

    return {
      success: true,
      data: {
        title: extracted.title || 'Untitled Recipe',
        description: extracted.description,
        image_url: extracted.image_url,
        prep_time: extracted.prep_time,
        cook_time: extracted.cook_time,
        total_time: extracted.total_time,
        servings: extracted.servings,
        ingredients: (extracted.ingredients || []).map((ing: any, idx: number) => ({
          name: ing.name || `Ingredient ${idx + 1}`,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes,
        })),
        instructions: (extracted.instructions || []).map((inst: any, idx: number) => ({
          step: inst.step || idx + 1,
          text: inst.text || inst,
        })),
        nutrition: extracted.nutrition,
        tags: extracted.tags,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract recipe',
    };
  }
}
