
> refyne-recipeapp@0.0.1 db:export
> npx tsx scripts/export-seed.ts *** --remote

-- Seed data for Recipe App
-- Exported from database: 2026-01-24T20:17:48.848Z
-- Recipe: Eggs Benedict

-- Recipe
INSERT OR REPLACE INTO recipes (id, title, description, image_url, author, author_url, prep_time, cook_time, total_time, servings, source_url)
VALUES (
  '7f924992-71ab-43cd-87b6-55ca3b44bb5f',
  'Eggs Benedict',
  NULL,
  'https://publicdomainrecipes.com/pix/eggs-benedict.webp',
  NULL,
  NULL,
  '15 min',
  '20 min',
  NULL,
  2,
  'https://publicdomainrecipes.com/eggs-benedict/'
);

-- Ingredients
INSERT OR REPLACE INTO ingredients (id, recipe_id, name, quantity, unit, notes, sort_order) VALUES
  ('15a33661-dd29-4853-b234-98d35699b882', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 'egg yolks', '3', NULL, NULL, 0),
  ('b368f853-ec20-4759-b214-005ff99fd267', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 'lemon juice', '1', 'tablespoon', NULL, 1),
  ('36da4d43-c97e-47af-94a9-94cfeede9e69', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 'unsalted butter', '1/2', 'cup', 'melted', 2),
  ('1adedc0c-a502-4558-b937-ce5f375a0154', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 'Cayenne pepper or hot sauce', NULL, NULL, 'to taste (optional)', 3),
  ('6f975097-4199-4c26-a881-cb2638223e6a', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 'eggs', '4', NULL, NULL, 4),
  ('6a74fecd-d9d7-4278-86f1-ffafb4f8de98', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 'white vinegar', '1', 'tablespoon', NULL, 5),
  ('d5de7f81-53af-442a-bde6-604fe070e3b8', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 'english muffins or toast', '2', NULL, 'split', 6),
  ('db905d3c-c6e2-49f0-9b72-c88933ab7e63', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 'Canadian bacon or ham', '4', 'slices', NULL, 7),
  ('90e43102-4338-4653-8915-c8460e3f70a8', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 'Butter', NULL, NULL, 'for spreading on muffins (optional)', 8),
  ('ef85e245-f480-4bc8-aa3f-bbdff384650b', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 'Chives', NULL, NULL, 'finely chopped (optional)', 9);

-- Instructions
INSERT OR REPLACE INTO instructions (id, recipe_id, step_number, instruction, image_urls) VALUES
  ('bfb4dc8d-3de3-4a18-9c11-852016374730', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 1, 'Blend Yolks and Lemon Juice: In a blender, blend the yolks and lemon juice to create the base for the hollandaise sauce. This can optionally be done in a double boiler on a gentle simmer with whisking instead of blending to reduce curdling.', NULL),
  ('8880c8dd-3a9e-4b5d-9e93-f4b7fcdac898', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 2, 'Drizzle Butter: Slowly pour in the melted butter while blending. The sauce should thicken and become creamy. If it becomes too viscous, add a little warm water or lemon juice to thin it out.', NULL),
  ('98f5ef1c-8553-4308-abed-2615748ba351', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 3, 'Season Sauce: Season to taste with cayenne pepper or hot sauce.', NULL),
  ('b5472f9b-b32e-4550-a604-6307864bbb48', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 4, 'Heat Water to Simmer: Prepare a large saucepan with at least four inches of water and bring it to a gentle simmer. Add the vinegar to help the egg whites set.', NULL),
  ('23a14b34-8446-49bb-b4bd-e703ceed5359', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 5, 'Poach Eggs 3-4 Minutes: Gently slide the eggs into the simmering water. It helps to crack the eggs into a small bowl or ladle, bring the vessel to the surface of the water, and then drop the egg in that way. While cooking, take a spoon and stir the water into a little whirlpool; this can help displace the excess egg whites, giving the poached eggs a cleaner, firmer appearance. Cook for 3-4 minutes.', NULL),
  ('49c82440-e219-4d74-900e-e19fa0171ad1', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 6, 'Remove Eggs: Remove the eggs with a slotted spoon and place them on a paper towel-lined plate to drain.', NULL),
  ('ed3d05e4-d70b-4b39-8bfc-4e7c76757fba', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 7, 'Toast Muffins: Halve the muffins and toast them. Optionally butter both halves. You could substitute the muffins with any kind of spongey bread.', NULL),
  ('f046c9b8-3e9e-48c9-9415-9bbc6197b807', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 8, 'Cook Bacon: In a skillet on medium heat, cook the Canadian bacon or ham until slightly browned.', NULL),
  ('2468d81c-c962-4539-8184-0c34e073f5e3', '7f924992-71ab-43cd-87b6-55ca3b44bb5f', 9, 'Assemble: Place a slice of Canadian bacon on each toasted muffin half, top with a poached egg and a generous amount of hollandaise sauce. Garnish with cut chives and more cayenne pepper if desired.', NULL);

