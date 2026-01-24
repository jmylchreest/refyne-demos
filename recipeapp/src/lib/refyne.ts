// Refyne API integration for recipe extraction
// Using the official @refyne/sdk TypeScript SDK

import { Refyne } from '@refyne/sdk';

export interface ExtractedRecipe {
  title: string;
  description?: string;
  image_url?: string;
  author?: string;
  author_url?: string;
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
    image_urls?: string[];
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

//#region recipe-schema
// Recipe extraction schema for Refyne
const RECIPE_SCHEMA = `
name: Recipe
description: |
  Extract recipe details from a webpage.

  IMPORTANT: Only extract images that are directly relevant to the recipe:
  - The main recipe/dish photo
  - Step-by-step cooking process photos
  - Photos showing ingredients or final plating

  DO NOT extract:
  - Author/profile photos
  - Advertisement images
  - Social media icons
  - Navigation or UI elements
  - Unrelated promotional images

fields:
  - name: title
    type: string
    required: true
    description: The recipe name or title

  - name: description
    type: string
    description: Brief description or intro paragraph about the dish

  - name: author
    type: string
    description: Name of the recipe author or content creator

  - name: author_url
    type: string
    description: URL to the author's profile page or website (if available)

  - name: image_url
    type: string
    description: URL of the main recipe/dish image (the hero photo of the finished dish)

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
    description: Step-by-step cooking instructions
    items:
      type: object
      properties:
        step:
          type: integer
          description: Step number
        text:
          type: string
          required: true
          description: Instruction text for this step
        image_urls:
          type: array
          description: URLs of images showing this cooking step (only include relevant cooking photos)
          items:
            type: string

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
    description: Recipe categories or tags (e.g., "vegetarian", "quick", "Italian")
    items:
      type: string
`;
//#endregion recipe-schema

//#region extract-recipe
/**
 * Create a Refyne SDK client with the given configuration.
 */
function createClient(apiUrl: string, apiKey: string, referer?: string): Refyne {
  return new Refyne({
    apiKey,
    baseUrl: apiUrl,
    referer: referer || 'https://recipeapp-demo.refyne.uk',
  });
}

/**
 * Extract recipe data from a URL using the Refyne SDK.
 * Uses synchronous extraction - waits for the result.
 */
export async function extractRecipe(
  url: string,
  apiUrl: string,
  apiKey: string,
  referer?: string
): Promise<RefyneResponse> {
  try {
    const client = createClient(apiUrl, apiKey, referer);

    const result = await client.extract({
      url,
      schema: RECIPE_SCHEMA,
    });

    if (!result || result.error) {
      return {
        success: false,
        error: result?.error || 'Extraction failed',
      };
    }

    // Extract the recipe data from the response
    const extracted = result.data || result;

    return {
      success: true,
      data: {
        title: extracted.title || 'Untitled Recipe',
        description: extracted.description,
        image_url: extracted.image_url,
        author: extracted.author,
        author_url: extracted.author_url,
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
          image_urls: inst.image_urls || [],
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
//#endregion extract-recipe

export { RECIPE_SCHEMA };
