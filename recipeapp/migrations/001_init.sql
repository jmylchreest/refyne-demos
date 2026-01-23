-- Recipe App Database Schema
-- D1 SQLite database for recipe storage

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  prep_time TEXT,
  cook_time TEXT,
  total_time TEXT,
  servings INTEGER,
  source_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity TEXT,
  unit TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Instructions table
CREATE TABLE IF NOT EXISTS instructions (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Shopping list items
CREATE TABLE IF NOT EXISTS shopping_list (
  id TEXT PRIMARY KEY,
  ingredient_name TEXT NOT NULL,
  quantity TEXT,
  unit TEXT,
  checked INTEGER DEFAULT 0,
  recipe_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe ON ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_instructions_recipe ON instructions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_recipe ON shopping_list(recipe_id);
