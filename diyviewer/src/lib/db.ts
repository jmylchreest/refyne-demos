// Database operations for DIY Viewer App

export interface Tutorial {
  id: string;
  title: string;
  overview: string | null;
  image_url: string | null;
  difficulty: string | null;
  estimated_time: string | null;
  source_url: string | null;
  created_at: string;
}

export interface Material {
  id: string;
  tutorial_id: string;
  item: string;
  quantity: string | null;
  notes: string | null;
  sort_order: number;
}

export interface Step {
  id: string;
  tutorial_id: string;
  step_number: number;
  title: string;
  instructions: string;
  tips: string | null;
}

export interface StepImage {
  id: string;
  step_id: string;
  image_url: string;
  sort_order: number;
}

export interface StepWithImages extends Step {
  images: StepImage[];
}

export interface ChecklistItem {
  id: string;
  material_name: string;
  quantity: string | null;
  notes: string | null;
  checked: boolean;
  tutorial_id: string | null;
  created_at: string;
}

export interface TutorialWithDetails extends Tutorial {
  materials: Material[];
  steps: StepWithImages[];
}

// Helper to generate UUIDs
export function generateId(): string {
  return crypto.randomUUID();
}

// Get all tutorials
export async function getTutorials(db: D1Database): Promise<Tutorial[]> {
  const { results } = await db
    .prepare('SELECT * FROM tutorials ORDER BY created_at DESC')
    .all<Tutorial>();
  return results || [];
}

// Get a single tutorial with materials and steps
export async function getTutorialById(db: D1Database, id: string): Promise<TutorialWithDetails | null> {
  const tutorial = await db
    .prepare('SELECT * FROM tutorials WHERE id = ?')
    .bind(id)
    .first<Tutorial>();

  if (!tutorial) return null;

  const { results: materials } = await db
    .prepare('SELECT * FROM materials WHERE tutorial_id = ? ORDER BY sort_order')
    .bind(id)
    .all<Material>();

  const { results: steps } = await db
    .prepare('SELECT * FROM steps WHERE tutorial_id = ? ORDER BY step_number')
    .bind(id)
    .all<Step>();

  // Get images for each step
  const stepsWithImages: StepWithImages[] = [];
  for (const step of steps || []) {
    const { results: images } = await db
      .prepare('SELECT * FROM step_images WHERE step_id = ? ORDER BY sort_order')
      .bind(step.id)
      .all<StepImage>();

    stepsWithImages.push({
      ...step,
      images: images || [],
    });
  }

  return {
    ...tutorial,
    materials: materials || [],
    steps: stepsWithImages,
  };
}

// Add a new tutorial with materials and steps
export async function addTutorial(
  db: D1Database,
  tutorial: Omit<Tutorial, 'id' | 'created_at'>,
  materials: Omit<Material, 'id' | 'tutorial_id'>[],
  steps: (Omit<Step, 'id' | 'tutorial_id'> & { image_urls?: string[] })[]
): Promise<string> {
  const tutorialId = generateId();

  // Insert tutorial
  await db
    .prepare(
      `INSERT INTO tutorials (id, title, overview, image_url, difficulty, estimated_time, source_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      tutorialId,
      tutorial.title,
      tutorial.overview,
      tutorial.image_url,
      tutorial.difficulty,
      tutorial.estimated_time,
      tutorial.source_url
    )
    .run();

  // Insert materials
  for (const mat of materials) {
    await db
      .prepare(
        `INSERT INTO materials (id, tutorial_id, item, quantity, notes, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(generateId(), tutorialId, mat.item, mat.quantity, mat.notes, mat.sort_order)
      .run();
  }

  // Insert steps and their images
  for (const step of steps) {
    const stepId = generateId();
    await db
      .prepare(
        `INSERT INTO steps (id, tutorial_id, step_number, title, instructions, tips)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(stepId, tutorialId, step.step_number, step.title, step.instructions, step.tips)
      .run();

    // Insert step images
    if (step.image_urls) {
      for (let i = 0; i < step.image_urls.length; i++) {
        await db
          .prepare(
            `INSERT INTO step_images (id, step_id, image_url, sort_order)
             VALUES (?, ?, ?, ?)`
          )
          .bind(generateId(), stepId, step.image_urls[i], i)
          .run();
      }
    }
  }

  return tutorialId;
}

// Delete a tutorial
export async function deleteTutorial(db: D1Database, id: string): Promise<void> {
  // Get all step IDs first to delete their images
  const { results: steps } = await db
    .prepare('SELECT id FROM steps WHERE tutorial_id = ?')
    .bind(id)
    .all<{ id: string }>();

  // Delete step images
  for (const step of steps || []) {
    await db.prepare('DELETE FROM step_images WHERE step_id = ?').bind(step.id).run();
  }

  // Delete tutorial (cascades to materials and steps)
  await db.prepare('DELETE FROM tutorials WHERE id = ?').bind(id).run();
}

// Materials checklist operations
export async function getChecklist(db: D1Database): Promise<ChecklistItem[]> {
  const { results } = await db
    .prepare('SELECT * FROM materials_checklist ORDER BY created_at DESC')
    .all<{ id: string; material_name: string; quantity: string | null; notes: string | null; checked: number; tutorial_id: string | null; created_at: string }>();

  return (results || []).map(item => ({
    ...item,
    checked: item.checked === 1,
  }));
}

export async function addToChecklist(
  db: D1Database,
  item: Omit<ChecklistItem, 'id' | 'created_at' | 'checked'>
): Promise<string> {
  const id = generateId();
  await db
    .prepare(
      `INSERT INTO materials_checklist (id, material_name, quantity, notes, tutorial_id)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(id, item.material_name, item.quantity, item.notes, item.tutorial_id)
    .run();
  return id;
}

export async function toggleChecklistItem(db: D1Database, id: string): Promise<void> {
  await db
    .prepare('UPDATE materials_checklist SET checked = NOT checked WHERE id = ?')
    .bind(id)
    .run();
}

export async function removeChecklistItem(db: D1Database, id: string): Promise<void> {
  await db.prepare('DELETE FROM materials_checklist WHERE id = ?').bind(id).run();
}

export async function clearChecklist(db: D1Database): Promise<void> {
  await db.prepare('DELETE FROM materials_checklist').run();
}

export async function addTutorialToChecklist(db: D1Database, tutorialId: string): Promise<void> {
  const { results: materials } = await db
    .prepare('SELECT * FROM materials WHERE tutorial_id = ?')
    .bind(tutorialId)
    .all<Material>();

  for (const mat of materials || []) {
    await addToChecklist(db, {
      material_name: mat.item,
      quantity: mat.quantity,
      notes: mat.notes,
      tutorial_id: tutorialId,
    });
  }
}
