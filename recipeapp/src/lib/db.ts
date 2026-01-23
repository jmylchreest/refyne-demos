// Database operations for Recipe App

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  prep_time: string | null;
  cook_time: string | null;
  total_time: string | null;
  servings: number | null;
  source_url: string | null;
  created_at: string;
}

export interface Ingredient {
  id: string;
  recipe_id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  notes: string | null;
  sort_order: number;
}

export interface Instruction {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
}

export interface ShoppingListItem {
  id: string;
  ingredient_name: string;
  quantity: string | null;
  unit: string | null;
  checked: boolean;
  recipe_id: string | null;
  created_at: string;
}

export interface RecipeWithDetails extends Recipe {
  ingredients: Ingredient[];
  instructions: Instruction[];
}

// Helper to generate UUIDs
export function generateId(): string {
  return crypto.randomUUID();
}

// Get all recipes
export async function getRecipes(db: D1Database): Promise<Recipe[]> {
  const { results } = await db
    .prepare('SELECT * FROM recipes ORDER BY created_at DESC')
    .all<Recipe>();
  return results || [];
}

// Get a single recipe with ingredients and instructions
export async function getRecipeById(db: D1Database, id: string): Promise<RecipeWithDetails | null> {
  const recipe = await db
    .prepare('SELECT * FROM recipes WHERE id = ?')
    .bind(id)
    .first<Recipe>();

  if (!recipe) return null;

  const { results: ingredients } = await db
    .prepare('SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY sort_order')
    .bind(id)
    .all<Ingredient>();

  const { results: instructions } = await db
    .prepare('SELECT * FROM instructions WHERE recipe_id = ? ORDER BY step_number')
    .bind(id)
    .all<Instruction>();

  return {
    ...recipe,
    ingredients: ingredients || [],
    instructions: instructions || [],
  };
}

// Add a new recipe with ingredients and instructions
export async function addRecipe(
  db: D1Database,
  recipe: Omit<Recipe, 'id' | 'created_at'>,
  ingredients: Omit<Ingredient, 'id' | 'recipe_id'>[],
  instructions: Omit<Instruction, 'id' | 'recipe_id'>[]
): Promise<string> {
  const recipeId = generateId();

  // Insert recipe
  await db
    .prepare(
      `INSERT INTO recipes (id, title, description, image_url, prep_time, cook_time, total_time, servings, source_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      recipeId,
      recipe.title,
      recipe.description,
      recipe.image_url,
      recipe.prep_time,
      recipe.cook_time,
      recipe.total_time,
      recipe.servings,
      recipe.source_url
    )
    .run();

  // Insert ingredients
  for (const ing of ingredients) {
    await db
      .prepare(
        `INSERT INTO ingredients (id, recipe_id, name, quantity, unit, notes, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(generateId(), recipeId, ing.name, ing.quantity, ing.unit, ing.notes, ing.sort_order)
      .run();
  }

  // Insert instructions
  for (const inst of instructions) {
    await db
      .prepare(
        `INSERT INTO instructions (id, recipe_id, step_number, instruction)
         VALUES (?, ?, ?, ?)`
      )
      .bind(generateId(), recipeId, inst.step_number, inst.instruction)
      .run();
  }

  return recipeId;
}

// Delete a recipe
export async function deleteRecipe(db: D1Database, id: string): Promise<void> {
  await db.prepare('DELETE FROM recipes WHERE id = ?').bind(id).run();
}

// Shopping list operations
export async function getShoppingList(db: D1Database): Promise<ShoppingListItem[]> {
  const { results } = await db
    .prepare('SELECT * FROM shopping_list ORDER BY created_at DESC')
    .all<{ id: string; ingredient_name: string; quantity: string | null; unit: string | null; checked: number; recipe_id: string | null; created_at: string }>();

  return (results || []).map(item => ({
    ...item,
    checked: item.checked === 1,
  }));
}

export async function addToShoppingList(
  db: D1Database,
  item: Omit<ShoppingListItem, 'id' | 'created_at' | 'checked'>
): Promise<string> {
  const id = generateId();
  await db
    .prepare(
      `INSERT INTO shopping_list (id, ingredient_name, quantity, unit, recipe_id)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(id, item.ingredient_name, item.quantity, item.unit, item.recipe_id)
    .run();
  return id;
}

export async function toggleShoppingItem(db: D1Database, id: string): Promise<void> {
  await db
    .prepare('UPDATE shopping_list SET checked = NOT checked WHERE id = ?')
    .bind(id)
    .run();
}

export async function removeShoppingItem(db: D1Database, id: string): Promise<void> {
  await db.prepare('DELETE FROM shopping_list WHERE id = ?').bind(id).run();
}

export async function clearShoppingList(db: D1Database): Promise<void> {
  await db.prepare('DELETE FROM shopping_list').run();
}

export async function addRecipeToShoppingList(db: D1Database, recipeId: string): Promise<void> {
  const { results: ingredients } = await db
    .prepare('SELECT * FROM ingredients WHERE recipe_id = ?')
    .bind(recipeId)
    .all<Ingredient>();

  for (const ing of ingredients || []) {
    await addToShoppingList(db, {
      ingredient_name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      recipe_id: recipeId,
    });
  }
}
