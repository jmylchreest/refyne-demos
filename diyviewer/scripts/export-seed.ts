#!/usr/bin/env npx tsx
/**
 * Export a tutorial from the database as seed SQL
 *
 * Usage:
 *   npx tsx scripts/export-seed.ts <tutorial-id>
 *   npx tsx scripts/export-seed.ts <tutorial-id> --remote  # Use remote D1
 *
 * Output goes to stdout, redirect to file:
 *   npx tsx scripts/export-seed.ts abc123 > migrations/002_seed.sql
 */

import { execSync } from 'child_process';

const DB_NAME = 'refyne-diyviewer-db';

function escapeSQL(str: string | null | undefined): string {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function runD1Query(sql: string, remote: boolean): any[] {
  const remoteFlag = remote ? '--remote' : '--local';
  const cmd = `wrangler d1 execute ${DB_NAME} ${remoteFlag} --json --command="${sql.replace(/"/g, '\\"')}"`;

  try {
    const output = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    const parsed = JSON.parse(output);
    return parsed[0]?.results || [];
  } catch (error: any) {
    console.error('D1 query failed:', error.message);
    process.exit(1);
  }
}

function generateTutorialSeed(tutorialId: string, remote: boolean): string {
  // Escape tutorialId for safe SQL interpolation
  const safeId = escapeSQL(tutorialId);

  // Fetch tutorial
  const tutorials = runD1Query(`SELECT * FROM tutorials WHERE id = ${safeId}`, remote);
  if (tutorials.length === 0) {
    console.error(`Tutorial not found: ${tutorialId}`);
    process.exit(1);
  }
  const tutorial = tutorials[0];

  // Fetch glossary
  const glossary = runD1Query(
    `SELECT * FROM glossary WHERE tutorial_id = ${safeId} ORDER BY sort_order`,
    remote
  );

  // Fetch materials
  const materials = runD1Query(
    `SELECT * FROM materials WHERE tutorial_id = ${safeId} ORDER BY sort_order`,
    remote
  );

  // Fetch tools
  const tools = runD1Query(
    `SELECT * FROM tools WHERE tutorial_id = ${safeId} ORDER BY sort_order`,
    remote
  );

  // Fetch steps
  const steps = runD1Query(
    `SELECT * FROM steps WHERE tutorial_id = ${safeId} ORDER BY step_number`,
    remote
  );

  // Fetch step images for all steps
  const stepIds = steps.map((s: any) => escapeSQL(s.id)).join(', ');
  const stepImages = stepIds
    ? runD1Query(`SELECT * FROM step_images WHERE step_id IN (${stepIds}) ORDER BY step_id, sort_order`, remote)
    : [];

  // Generate SQL
  const lines: string[] = [
    '-- Seed data for DIY Viewer App',
    `-- Exported from database: ${new Date().toISOString()}`,
    `-- Tutorial: ${tutorial.title}`,
    '',
    '-- Tutorial',
    `INSERT OR REPLACE INTO tutorials (id, title, overview, image_url, author, author_url, difficulty, estimated_time, source_url)`,
    `VALUES (`,
    `  ${escapeSQL(tutorial.id)},`,
    `  ${escapeSQL(tutorial.title)},`,
    `  ${escapeSQL(tutorial.overview)},`,
    `  ${escapeSQL(tutorial.image_url)},`,
    `  ${escapeSQL(tutorial.author)},`,
    `  ${escapeSQL(tutorial.author_url)},`,
    `  ${escapeSQL(tutorial.difficulty)},`,
    `  ${escapeSQL(tutorial.estimated_time)},`,
    `  ${escapeSQL(tutorial.source_url)}`,
    `);`,
    '',
  ];

  // Glossary
  if (glossary.length > 0) {
    lines.push('-- Glossary');
    lines.push(`INSERT OR REPLACE INTO glossary (id, tutorial_id, term, definition, context, sort_order) VALUES`);

    const glossaryValues = glossary.map((g: any, idx: number) => {
      const comma = idx < glossary.length - 1 ? ',' : ';';
      return `  (${escapeSQL(g.id)}, ${escapeSQL(g.tutorial_id)}, ${escapeSQL(g.term)}, ${escapeSQL(g.definition)}, ${escapeSQL(g.context)}, ${g.sort_order})${comma}`;
    });
    lines.push(...glossaryValues);
    lines.push('');
  }

  // Materials
  if (materials.length > 0) {
    lines.push('-- Materials');
    lines.push(`INSERT OR REPLACE INTO materials (id, tutorial_id, name, quantity, notes, measurement_json, sort_order) VALUES`);

    const matValues = materials.map((m: any, idx: number) => {
      const comma = idx < materials.length - 1 ? ',' : ';';
      return `  (${escapeSQL(m.id)}, ${escapeSQL(m.tutorial_id)}, ${escapeSQL(m.name)}, ${escapeSQL(m.quantity)}, ${escapeSQL(m.notes)}, ${escapeSQL(m.measurement_json)}, ${m.sort_order})${comma}`;
    });
    lines.push(...matValues);
    lines.push('');
  }

  // Tools
  if (tools.length > 0) {
    lines.push('-- Tools');
    lines.push(`INSERT OR REPLACE INTO tools (id, tutorial_id, name, notes, required, sort_order) VALUES`);

    const toolValues = tools.map((t: any, idx: number) => {
      const comma = idx < tools.length - 1 ? ',' : ';';
      return `  (${escapeSQL(t.id)}, ${escapeSQL(t.tutorial_id)}, ${escapeSQL(t.name)}, ${escapeSQL(t.notes)}, ${t.required}, ${t.sort_order})${comma}`;
    });
    lines.push(...toolValues);
    lines.push('');
  }

  // Steps
  if (steps.length > 0) {
    lines.push('-- Steps');
    lines.push(`INSERT OR REPLACE INTO steps (id, tutorial_id, step_number, title, instructions, tips, measurements_json) VALUES`);

    const stepValues = steps.map((s: any, idx: number) => {
      const comma = idx < steps.length - 1 ? ',' : ';';
      return `  (${escapeSQL(s.id)}, ${escapeSQL(s.tutorial_id)}, ${s.step_number}, ${escapeSQL(s.title)}, ${escapeSQL(s.instructions)}, ${escapeSQL(s.tips)}, ${escapeSQL(s.measurements_json)})${comma}`;
    });
    lines.push(...stepValues);
    lines.push('');
  }

  // Step images
  if (stepImages.length > 0) {
    lines.push('-- Step Images');
    lines.push(`INSERT OR REPLACE INTO step_images (id, step_id, image_url, sort_order) VALUES`);

    const imageValues = stepImages.map((img: any, idx: number) => {
      const comma = idx < stepImages.length - 1 ? ',' : ';';
      return `  (${escapeSQL(img.id)}, ${escapeSQL(img.step_id)}, ${escapeSQL(img.image_url)}, ${img.sort_order})${comma}`;
    });
    lines.push(...imageValues);
    lines.push('');
  }

  return lines.join('\n');
}

// Main
const args = process.argv.slice(2);
const tutorialId = args.find(a => !a.startsWith('--'));
const remote = args.includes('--remote');

if (!tutorialId) {
  console.error('Usage: npx tsx scripts/export-seed.ts <tutorial-id> [--remote]');
  console.error('');
  console.error('List tutorials with:');
  console.error(`  wrangler d1 execute ${DB_NAME} --local --command="SELECT id, title FROM tutorials"`);
  process.exit(1);
}

console.log(generateTutorialSeed(tutorialId, remote));
