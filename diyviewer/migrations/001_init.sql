-- DIY Viewer Database Schema
-- D1 SQLite database for tutorial storage

-- Tutorials table
CREATE TABLE IF NOT EXISTS tutorials (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  overview TEXT,
  image_url TEXT,
  author TEXT,
  author_url TEXT,
  difficulty TEXT,
  estimated_time TEXT,
  source_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Glossary table for technical terms
CREATE TABLE IF NOT EXISTS glossary (
  id TEXT PRIMARY KEY,
  tutorial_id TEXT NOT NULL,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  context TEXT,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE CASCADE
);

-- Materials table (consumables)
CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  tutorial_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity TEXT,
  notes TEXT,
  measurement_json TEXT,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE CASCADE
);

-- Tools table (reusable equipment)
CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY,
  tutorial_id TEXT NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  required INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE CASCADE
);

-- Steps table
CREATE TABLE IF NOT EXISTS steps (
  id TEXT PRIMARY KEY,
  tutorial_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  tips TEXT,
  measurements_json TEXT,
  FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE CASCADE
);

-- Step images table (multiple images per step)
CREATE TABLE IF NOT EXISTS step_images (
  id TEXT PRIMARY KEY,
  step_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (step_id) REFERENCES steps(id) ON DELETE CASCADE
);

-- Materials checklist (for tracking what you have)
CREATE TABLE IF NOT EXISTS materials_checklist (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  quantity TEXT,
  notes TEXT,
  checked INTEGER DEFAULT 0,
  tutorial_id TEXT,
  item_type TEXT DEFAULT 'material',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_glossary_tutorial ON glossary(tutorial_id);
CREATE INDEX IF NOT EXISTS idx_materials_tutorial ON materials(tutorial_id);
CREATE INDEX IF NOT EXISTS idx_tools_tutorial ON tools(tutorial_id);
CREATE INDEX IF NOT EXISTS idx_steps_tutorial ON steps(tutorial_id);
CREATE INDEX IF NOT EXISTS idx_step_images_step ON step_images(step_id);
CREATE INDEX IF NOT EXISTS idx_checklist_tutorial ON materials_checklist(tutorial_id);
