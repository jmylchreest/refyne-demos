-- Add resource links to materials and steps
-- Allows storing purchase URLs for materials and helpful tutorial links for steps

-- Add purchase_url column to materials table
ALTER TABLE materials ADD COLUMN purchase_url TEXT;

-- Add helpful_links column to steps table (stored as JSON array)
ALTER TABLE steps ADD COLUMN helpful_links TEXT;
