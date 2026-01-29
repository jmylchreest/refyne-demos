-- Add skill references and safety warnings tables for enriched step content

-- Skill references table (learning resources for techniques)
CREATE TABLE IF NOT EXISTS step_skill_references (
  id TEXT PRIMARY KEY,
  step_id TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  description TEXT NOT NULL,
  search_query TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (step_id) REFERENCES steps(id) ON DELETE CASCADE
);

-- Safety warnings table (hazard alerts per step)
CREATE TABLE IF NOT EXISTS step_safety_warnings (
  id TEXT PRIMARY KEY,
  step_id TEXT NOT NULL,
  warning TEXT NOT NULL,
  severity TEXT NOT NULL,
  ppe_required_json TEXT,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (step_id) REFERENCES steps(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_skill_refs_step ON step_skill_references(step_id);
CREATE INDEX IF NOT EXISTS idx_safety_warnings_step ON step_safety_warnings(step_id);
