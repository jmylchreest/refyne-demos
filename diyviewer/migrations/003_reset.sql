-- Daily reset script for DIY Viewer App
-- Drops all user-added data and re-seeds with defaults

-- Clear all tables
DELETE FROM materials_checklist;
DELETE FROM step_images;
DELETE FROM steps;
DELETE FROM materials;
DELETE FROM tutorials;

-- Re-seed with default tutorial (copy from 002_seed.sql)

-- Tutorial 1: Simple Phone Stand
INSERT INTO tutorials (id, title, overview, image_url, difficulty, estimated_time, source_url)
VALUES (
  'seed-phonestand-001',
  'Simple Cardboard Phone Stand',
  'Build a sturdy phone stand from cardboard in minutes. Perfect for video calls, watching videos, or following recipes while cooking.',
  'https://content.instructables.com/F0E/XSRD/IUXGXWZZ/F0EXSRDIUXGXWZZ.jpg',
  'Easy',
  '15 minutes',
  'https://www.instructables.com/Simple-Cardboard-Phone-Stand/'
);

INSERT INTO materials (id, tutorial_id, item, quantity, notes, sort_order) VALUES
  ('seed-ps-mat-1', 'seed-phonestand-001', 'Cardboard sheet', '1', 'About 15x10cm, thick corrugated works best', 0),
  ('seed-ps-mat-2', 'seed-phonestand-001', 'Scissors or craft knife', '1', NULL, 1),
  ('seed-ps-mat-3', 'seed-phonestand-001', 'Ruler', '1', NULL, 2),
  ('seed-ps-mat-4', 'seed-phonestand-001', 'Pencil', '1', 'For marking', 3);

INSERT INTO steps (id, tutorial_id, step_number, title, instructions, tips) VALUES
  ('seed-ps-step-1', 'seed-phonestand-001', 1, 'Gather Materials', 'Collect all the materials listed above. Make sure your cardboard is clean and sturdy - shipping boxes work great for this project.', 'Double-wall corrugated cardboard is the strongest option'),
  ('seed-ps-step-2', 'seed-phonestand-001', 2, 'Mark the Template', 'Using your ruler and pencil, draw a rectangle about 12cm x 8cm on the cardboard. Then draw a line 4cm from one of the short edges.', 'Make sure your lines are straight for a professional look'),
  ('seed-ps-step-3', 'seed-phonestand-001', 3, 'Cut the Base', 'Carefully cut out the rectangle. Then score (don''t cut through) the line you drew - this will be your fold line.', 'Scoring means cutting halfway through the cardboard'),
  ('seed-ps-step-4', 'seed-phonestand-001', 4, 'Create the Phone Slot', 'Cut a small slot about 5mm wide and 2cm long centered on the larger section. This slot holds your phone upright.', 'Test with your phone and adjust the slot width if needed'),
  ('seed-ps-step-5', 'seed-phonestand-001', 5, 'Fold and Test', 'Fold the cardboard along the scored line to create an L-shape. The larger section is the base, the smaller is the back support. Place your phone in the slot and adjust the angle.', 'You can add a second slot for landscape orientation');
