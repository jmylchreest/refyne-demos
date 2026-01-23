-- Seed data for Recipe App
-- Pre-loads 2 recipes from demo.refyne.uk

-- Recipe 1: Classic Spaghetti Carbonara
INSERT OR REPLACE INTO recipes (id, title, description, image_url, prep_time, cook_time, total_time, servings, source_url)
VALUES (
  'seed-carbonara-001',
  'Classic Spaghetti Carbonara',
  'A traditional Roman pasta dish made with eggs, cheese, pancetta, and black pepper. Rich, creamy, and absolutely delicious.',
  'https://cdn.dummyjson.com/recipe-images/1.webp',
  '10 minutes',
  '20 minutes',
  '30 minutes',
  4,
  'https://demo.refyne.uk/recipes/1'
);

INSERT OR REPLACE INTO ingredients (id, recipe_id, name, quantity, unit, sort_order) VALUES
  ('seed-carb-ing-1', 'seed-carbonara-001', 'spaghetti', '400', 'g', 1),
  ('seed-carb-ing-2', 'seed-carbonara-001', 'pancetta or guanciale', '200', 'g', 2),
  ('seed-carb-ing-3', 'seed-carbonara-001', 'large eggs', '4', '', 3),
  ('seed-carb-ing-4', 'seed-carbonara-001', 'Pecorino Romano cheese, grated', '100', 'g', 4),
  ('seed-carb-ing-5', 'seed-carbonara-001', 'black pepper', '', 'to taste', 5),
  ('seed-carb-ing-6', 'seed-carbonara-001', 'salt', '', 'to taste', 6);

INSERT OR REPLACE INTO instructions (id, recipe_id, step_number, instruction) VALUES
  ('seed-carb-ins-1', 'seed-carbonara-001', 1, 'Bring a large pot of salted water to boil and cook spaghetti until al dente.'),
  ('seed-carb-ins-2', 'seed-carbonara-001', 2, 'While pasta cooks, cut pancetta into small cubes and fry until crispy.'),
  ('seed-carb-ins-3', 'seed-carbonara-001', 3, 'In a bowl, whisk eggs with grated cheese and plenty of black pepper.'),
  ('seed-carb-ins-4', 'seed-carbonara-001', 4, 'Drain pasta, reserving some cooking water.'),
  ('seed-carb-ins-5', 'seed-carbonara-001', 5, 'Toss hot pasta with pancetta, then remove from heat.'),
  ('seed-carb-ins-6', 'seed-carbonara-001', 6, 'Add egg mixture and toss quickly, adding pasta water if needed.'),
  ('seed-carb-ins-7', 'seed-carbonara-001', 7, 'Serve immediately with extra cheese and pepper.');

-- Recipe 2: Simple Avocado Toast
INSERT OR REPLACE INTO recipes (id, title, description, image_url, prep_time, cook_time, total_time, servings, source_url)
VALUES (
  'seed-avocado-001',
  'Simple Avocado Toast',
  'A quick and healthy breakfast classic. Creamy avocado on crispy sourdough with a kick of red pepper flakes.',
  'https://cdn.dummyjson.com/recipe-images/2.webp',
  '5 minutes',
  '5 minutes',
  '10 minutes',
  1,
  'https://demo.refyne.uk/recipes/2'
);

INSERT OR REPLACE INTO ingredients (id, recipe_id, name, quantity, unit, sort_order) VALUES
  ('seed-avo-ing-1', 'seed-avocado-001', 'sourdough bread', '2', 'slices', 1),
  ('seed-avo-ing-2', 'seed-avocado-001', 'ripe avocado', '1', '', 2),
  ('seed-avo-ing-3', 'seed-avocado-001', 'salt', '', 'to taste', 3),
  ('seed-avo-ing-4', 'seed-avocado-001', 'black pepper', '', 'to taste', 4),
  ('seed-avo-ing-5', 'seed-avocado-001', 'red pepper flakes', '', 'to taste', 5),
  ('seed-avo-ing-6', 'seed-avocado-001', 'lemon juice', '1', 'tsp', 6);

INSERT OR REPLACE INTO instructions (id, recipe_id, step_number, instruction) VALUES
  ('seed-avo-ins-1', 'seed-avocado-001', 1, 'Toast the bread until golden and crispy.'),
  ('seed-avo-ins-2', 'seed-avocado-001', 2, 'Cut avocado in half, remove pit, and scoop into a bowl.'),
  ('seed-avo-ins-3', 'seed-avocado-001', 3, 'Mash with a fork and season with salt, pepper, and lemon juice.'),
  ('seed-avo-ins-4', 'seed-avocado-001', 4, 'Spread onto toast and top with red pepper flakes.');
