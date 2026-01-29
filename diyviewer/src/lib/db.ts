// Database operations for DIY Viewer App

export interface MeasurementConversion {
  original: string;
  metric: string;
  imperial: string;
}

export interface Tutorial {
  id: string;
  title: string;
  overview: string | null;
  image_url: string | null;
  author: string | null;
  author_url: string | null;
  difficulty: string | null;
  estimated_time: string | null;
  source_url: string | null;
  created_at: string;
}

export interface GlossaryTerm {
  id: string;
  tutorial_id: string;
  term: string;
  definition: string;
  context: string | null;
  sort_order: number;
}

export interface Material {
  id: string;
  tutorial_id: string;
  name: string;
  quantity: string | null;
  notes: string | null;
  measurement: MeasurementConversion | null;
  sort_order: number;
}

export interface Tool {
  id: string;
  tutorial_id: string;
  name: string;
  notes: string | null;
  required: boolean;
  sort_order: number;
}

export interface SkillReference {
  id: string;
  step_id: string;
  skill_name: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  search_query: string;
  sort_order: number;
}

export interface SafetyWarning {
  id: string;
  step_id: string;
  warning: string;
  severity: 'caution' | 'warning' | 'danger';
  ppe_required: string[];
  sort_order: number;
}

export interface Step {
  id: string;
  tutorial_id: string;
  step_number: number;
  title: string;
  instructions: string;
  tips: string | null;
  measurements: MeasurementConversion[];
}

export interface StepImage {
  id: string;
  step_id: string;
  image_url: string;
  sort_order: number;
}

export interface StepWithDetails extends Step {
  images: StepImage[];
  skill_references: SkillReference[];
  safety_warnings: SafetyWarning[];
}

// Legacy alias for compatibility
export interface StepWithImages extends Step {
  images: StepImage[];
}

export interface ChecklistItem {
  id: string;
  name: string;
  quantity: string | null;
  notes: string | null;
  checked: boolean;
  tutorial_id: string | null;
  item_type: 'material' | 'tool';
  created_at: string;
}

export interface TutorialWithDetails extends Tutorial {
  glossary: GlossaryTerm[];
  materials: Material[];
  tools: Tool[];
  steps: StepWithDetails[];
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

// Get a single tutorial with all details
export async function getTutorialById(db: D1Database, id: string): Promise<TutorialWithDetails | null> {
  const tutorial = await db
    .prepare('SELECT * FROM tutorials WHERE id = ?')
    .bind(id)
    .first<Tutorial>();

  if (!tutorial) return null;

  // Get glossary terms
  const { results: glossary } = await db
    .prepare('SELECT * FROM glossary WHERE tutorial_id = ? ORDER BY sort_order')
    .bind(id)
    .all<GlossaryTerm>();

  // Get materials
  const { results: materialsRaw } = await db
    .prepare('SELECT * FROM materials WHERE tutorial_id = ? ORDER BY sort_order')
    .bind(id)
    .all<Omit<Material, 'measurement'> & { measurement_json: string | null }>();

  const materials: Material[] = (materialsRaw || []).map(mat => ({
    id: mat.id,
    tutorial_id: mat.tutorial_id,
    name: mat.name,
    quantity: mat.quantity,
    notes: mat.notes,
    sort_order: mat.sort_order,
    measurement: mat.measurement_json ? JSON.parse(mat.measurement_json) : null,
  }));

  // Get tools
  const { results: toolsRaw } = await db
    .prepare('SELECT * FROM tools WHERE tutorial_id = ? ORDER BY sort_order')
    .bind(id)
    .all<Omit<Tool, 'required'> & { required: number }>();

  const tools: Tool[] = (toolsRaw || []).map(tool => ({
    ...tool,
    required: tool.required === 1,
  }));

  // Get steps
  const { results: stepsRaw } = await db
    .prepare('SELECT * FROM steps WHERE tutorial_id = ? ORDER BY step_number')
    .bind(id)
    .all<Omit<Step, 'measurements'> & { measurements_json: string | null }>();

  // Get images, skill references, and safety warnings for each step
  const stepsWithDetails: StepWithDetails[] = [];
  for (const stepRaw of stepsRaw || []) {
    const { results: images } = await db
      .prepare('SELECT * FROM step_images WHERE step_id = ? ORDER BY sort_order')
      .bind(stepRaw.id)
      .all<StepImage>();

    const { results: skillRefsRaw } = await db
      .prepare('SELECT * FROM step_skill_references WHERE step_id = ? ORDER BY sort_order')
      .bind(stepRaw.id)
      .all<Omit<SkillReference, 'difficulty'> & { difficulty: string }>();

    const skillRefs: SkillReference[] = (skillRefsRaw || []).map(s => ({
      ...s,
      difficulty: s.difficulty as 'beginner' | 'intermediate' | 'advanced',
    }));

    const { results: safetyRaw } = await db
      .prepare('SELECT * FROM step_safety_warnings WHERE step_id = ? ORDER BY sort_order')
      .bind(stepRaw.id)
      .all<Omit<SafetyWarning, 'severity' | 'ppe_required'> & { severity: string; ppe_required_json: string | null }>();

    const safetyWarnings: SafetyWarning[] = (safetyRaw || []).map(w => ({
      id: w.id,
      step_id: w.step_id,
      warning: w.warning,
      severity: w.severity as 'caution' | 'warning' | 'danger',
      ppe_required: w.ppe_required_json ? JSON.parse(w.ppe_required_json) : [],
      sort_order: w.sort_order,
    }));

    stepsWithDetails.push({
      id: stepRaw.id,
      tutorial_id: stepRaw.tutorial_id,
      step_number: stepRaw.step_number,
      title: stepRaw.title,
      instructions: stepRaw.instructions,
      tips: stepRaw.tips,
      measurements: stepRaw.measurements_json ? JSON.parse(stepRaw.measurements_json) : [],
      images: images || [],
      skill_references: skillRefs,
      safety_warnings: safetyWarnings,
    });
  }

  return {
    ...tutorial,
    glossary: glossary || [],
    materials,
    tools,
    steps: stepsWithDetails,
  };
}

// Input types for adding a tutorial
export interface AddTutorialInput {
  title: string;
  overview: string | null;
  image_url: string | null;
  author: string | null;
  author_url: string | null;
  difficulty: string | null;
  estimated_time: string | null;
  source_url: string | null;
}

export interface AddGlossaryInput {
  term: string;
  definition: string;
  context?: string;
}

export interface AddMaterialInput {
  name: string;
  quantity?: string;
  notes?: string;
  measurement?: MeasurementConversion;
}

export interface AddToolInput {
  name: string;
  notes?: string;
  required: boolean;
}

export interface AddSkillReferenceInput {
  skill_name: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  search_query: string;
}

export interface AddSafetyWarningInput {
  warning: string;
  severity: 'caution' | 'warning' | 'danger';
  ppe_required?: string[];
}

export interface AddStepInput {
  step_number: number;
  title: string;
  instructions: string;
  tips?: string;
  image_urls?: string[];
  measurements?: MeasurementConversion[];
  skill_references?: AddSkillReferenceInput[];
  safety_warnings?: AddSafetyWarningInput[];
}

// Add a new tutorial with all related data
export async function addTutorial(
  db: D1Database,
  tutorial: AddTutorialInput,
  glossary: AddGlossaryInput[],
  materials: AddMaterialInput[],
  tools: AddToolInput[],
  steps: AddStepInput[]
): Promise<string> {
  const tutorialId = generateId();

  // Insert tutorial
  await db
    .prepare(
      `INSERT INTO tutorials (id, title, overview, image_url, author, author_url, difficulty, estimated_time, source_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      tutorialId,
      tutorial.title,
      tutorial.overview,
      tutorial.image_url,
      tutorial.author,
      tutorial.author_url,
      tutorial.difficulty,
      tutorial.estimated_time,
      tutorial.source_url
    )
    .run();

  // Insert glossary terms
  for (let i = 0; i < glossary.length; i++) {
    const term = glossary[i];
    await db
      .prepare(
        `INSERT INTO glossary (id, tutorial_id, term, definition, context, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(generateId(), tutorialId, term.term, term.definition, term.context || null, i)
      .run();
  }

  // Insert materials
  for (let i = 0; i < materials.length; i++) {
    const mat = materials[i];
    const measurementJson = mat.measurement ? JSON.stringify(mat.measurement) : null;
    await db
      .prepare(
        `INSERT INTO materials (id, tutorial_id, name, quantity, notes, measurement_json, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(generateId(), tutorialId, mat.name, mat.quantity || null, mat.notes || null, measurementJson, i)
      .run();
  }

  // Insert tools
  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    await db
      .prepare(
        `INSERT INTO tools (id, tutorial_id, name, notes, required, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(generateId(), tutorialId, tool.name, tool.notes || null, tool.required ? 1 : 0, i)
      .run();
  }

  // Insert steps and their images
  for (const step of steps) {
    const stepId = generateId();
    const measurementsJson = step.measurements && step.measurements.length > 0
      ? JSON.stringify(step.measurements)
      : null;

    await db
      .prepare(
        `INSERT INTO steps (id, tutorial_id, step_number, title, instructions, tips, measurements_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(stepId, tutorialId, step.step_number, step.title, step.instructions, step.tips || null, measurementsJson)
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

    // Insert skill references
    if (step.skill_references) {
      for (let i = 0; i < step.skill_references.length; i++) {
        const skill = step.skill_references[i];
        await db
          .prepare(
            `INSERT INTO step_skill_references (id, step_id, skill_name, difficulty, description, search_query, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(generateId(), stepId, skill.skill_name, skill.difficulty, skill.description, skill.search_query, i)
          .run();
      }
    }

    // Insert safety warnings
    if (step.safety_warnings) {
      for (let i = 0; i < step.safety_warnings.length; i++) {
        const warning = step.safety_warnings[i];
        const ppeJson = warning.ppe_required && warning.ppe_required.length > 0
          ? JSON.stringify(warning.ppe_required)
          : null;
        await db
          .prepare(
            `INSERT INTO step_safety_warnings (id, step_id, warning, severity, ppe_required_json, sort_order)
             VALUES (?, ?, ?, ?, ?, ?)`
          )
          .bind(generateId(), stepId, warning.warning, warning.severity, ppeJson, i)
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

  // Delete step-related data
  for (const step of steps || []) {
    await db.prepare('DELETE FROM step_images WHERE step_id = ?').bind(step.id).run();
    await db.prepare('DELETE FROM step_skill_references WHERE step_id = ?').bind(step.id).run();
    await db.prepare('DELETE FROM step_safety_warnings WHERE step_id = ?').bind(step.id).run();
  }

  // Delete related data (glossary, tools handled by CASCADE)
  await db.prepare('DELETE FROM glossary WHERE tutorial_id = ?').bind(id).run();
  await db.prepare('DELETE FROM tools WHERE tutorial_id = ?').bind(id).run();

  // Delete tutorial (cascades to materials and steps)
  await db.prepare('DELETE FROM tutorials WHERE id = ?').bind(id).run();
}

// Materials & Tools checklist operations
export async function getChecklist(db: D1Database): Promise<ChecklistItem[]> {
  const { results } = await db
    .prepare('SELECT * FROM materials_checklist ORDER BY created_at DESC')
    .all<{ id: string; name: string; quantity: string | null; notes: string | null; checked: number; tutorial_id: string | null; item_type: string; created_at: string }>();

  return (results || []).map(item => ({
    ...item,
    checked: item.checked === 1,
    item_type: (item.item_type || 'material') as 'material' | 'tool',
  }));
}

export async function addToChecklist(
  db: D1Database,
  item: { name: string; quantity?: string; notes?: string; tutorial_id?: string; item_type: 'material' | 'tool' }
): Promise<string> {
  const id = generateId();
  await db
    .prepare(
      `INSERT INTO materials_checklist (id, name, quantity, notes, tutorial_id, item_type)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(id, item.name, item.quantity || null, item.notes || null, item.tutorial_id || null, item.item_type)
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
  // Add materials to checklist
  const { results: materials } = await db
    .prepare('SELECT * FROM materials WHERE tutorial_id = ?')
    .bind(tutorialId)
    .all<{ name: string; quantity: string | null; notes: string | null }>();

  for (const mat of materials || []) {
    await addToChecklist(db, {
      name: mat.name,
      quantity: mat.quantity || undefined,
      notes: mat.notes || undefined,
      tutorial_id: tutorialId,
      item_type: 'material',
    });
  }

  // Add required tools to checklist
  const { results: tools } = await db
    .prepare('SELECT * FROM tools WHERE tutorial_id = ? AND required = 1')
    .bind(tutorialId)
    .all<{ name: string; notes: string | null }>();

  for (const tool of tools || []) {
    await addToChecklist(db, {
      name: tool.name,
      notes: tool.notes || undefined,
      tutorial_id: tutorialId,
      item_type: 'tool',
    });
  }
}
