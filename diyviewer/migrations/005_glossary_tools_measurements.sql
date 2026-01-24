-- Migration: Add glossary, separate tools from materials, add measurement conversions
-- This restructures the data model for better organization

-- Create glossary table for technical terms
CREATE TABLE IF NOT EXISTS glossary (
  id TEXT PRIMARY KEY,
  tutorial_id TEXT NOT NULL,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  context TEXT,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_glossary_tutorial ON glossary(tutorial_id);

-- Create tools table (separate from materials)
CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY,
  tutorial_id TEXT NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  required INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tools_tutorial ON tools(tutorial_id);

-- Rename 'item' to 'name' in materials for consistency, add measurement JSON
-- SQLite doesn't support RENAME COLUMN in older versions, so we recreate
-- First, create new table structure
CREATE TABLE IF NOT EXISTS materials_new (
  id TEXT PRIMARY KEY,
  tutorial_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity TEXT,
  notes TEXT,
  measurement_json TEXT,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE CASCADE
);

-- Copy data from old table (mapping 'item' to 'name')
INSERT INTO materials_new (id, tutorial_id, name, quantity, notes, sort_order)
SELECT id, tutorial_id, item, quantity, notes, sort_order FROM materials;

-- Drop old table and rename new one
DROP TABLE materials;
ALTER TABLE materials_new RENAME TO materials;

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_materials_tutorial ON materials(tutorial_id);

-- Add measurements JSON column to steps
ALTER TABLE steps ADD COLUMN measurements_json TEXT;

-- Drop the helpful_links and purchase_url columns we added before (cleanup)
-- SQLite doesn't support DROP COLUMN easily, so we'll just leave them unused
-- The code will ignore them

-- Update checklist table to use 'name' instead of 'material_name' for consistency
CREATE TABLE IF NOT EXISTS materials_checklist_new (
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

INSERT INTO materials_checklist_new (id, name, quantity, notes, checked, tutorial_id, created_at)
SELECT id, material_name, quantity, notes, checked, tutorial_id, created_at FROM materials_checklist;

DROP TABLE materials_checklist;
ALTER TABLE materials_checklist_new RENAME TO materials_checklist;

CREATE INDEX IF NOT EXISTS idx_checklist_tutorial ON materials_checklist(tutorial_id);
