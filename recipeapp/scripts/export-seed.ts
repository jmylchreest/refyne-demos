#!/usr/bin/env npx tsx
/**
 * Export a recipe from the database as seed SQL
 *
 * Usage:
 *   npx tsx scripts/export-seed.ts <recipe-id>
 *   npx tsx scripts/export-seed.ts <recipe-id> --remote  # Use remote D1
 *
 * Output goes to stdout, redirect to file:
 *   npx tsx scripts/export-seed.ts abc123 > migrations/002_seed.sql
 */

import { execSync } from 'child_process';

const DB_NAME = 'refyne-recipeapp-db';

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

function generateRecipeSeed(recipeId: string, remote: boolean): string {
  // Escape recipeId for safe SQL interpolation
  const safeId = escapeSQL(recipeId);

  // Fetch recipe
  const recipes = runD1Query(`SELECT * FROM recipes WHERE id = ${safeId}`, remote);
  if (recipes.length === 0) {
    console.error(`Recipe not found: ${recipeId}`);
    process.exit(1);
  }
  const recipe = recipes[0];

  // Fetch ingredients
  const ingredients = runD1Query(
    `SELECT * FROM ingredients WHERE recipe_id = ${safeId} ORDER BY sort_order`,
    remote
  );

  // Fetch instructions
  const instructions = runD1Query(
    `SELECT * FROM instructions WHERE recipe_id = ${safeId} ORDER BY step_number`,
    remote
  );

  // Generate SQL
  const lines: string[] = [
    '-- Seed data for Recipe App',
    `-- Exported from database: ${new Date().toISOString()}`,
    `-- Recipe: ${recipe.title}`,
    '',
    '-- Recipe',
    `INSERT OR REPLACE INTO recipes (id, title, description, image_url, author, author_url, prep_time, cook_time, total_time, servings, source_url)`,
    `VALUES (`,
    `  ${escapeSQL(recipe.id)},`,
    `  ${escapeSQL(recipe.title)},`,
    `  ${escapeSQL(recipe.description)},`,
    `  ${escapeSQL(recipe.image_url)},`,
    `  ${escapeSQL(recipe.author)},`,
    `  ${escapeSQL(recipe.author_url)},`,
    `  ${escapeSQL(recipe.prep_time)},`,
    `  ${escapeSQL(recipe.cook_time)},`,
    `  ${escapeSQL(recipe.total_time)},`,
    `  ${recipe.servings || 'NULL'},`,
    `  ${escapeSQL(recipe.source_url)}`,
    `);`,
    '',
  ];

  // Ingredients
  if (ingredients.length > 0) {
    lines.push('-- Ingredients');
    lines.push(`INSERT OR REPLACE INTO ingredients (id, recipe_id, name, quantity, unit, notes, sort_order) VALUES`);

    const ingValues = ingredients.map((ing: any, idx: number) => {
      const comma = idx < ingredients.length - 1 ? ',' : ';';
      return `  (${escapeSQL(ing.id)}, ${escapeSQL(ing.recipe_id)}, ${escapeSQL(ing.name)}, ${escapeSQL(ing.quantity)}, ${escapeSQL(ing.unit)}, ${escapeSQL(ing.notes)}, ${ing.sort_order})${comma}`;
    });
    lines.push(...ingValues);
    lines.push('');
  }

  // Instructions
  if (instructions.length > 0) {
    lines.push('-- Instructions');
    lines.push(`INSERT OR REPLACE INTO instructions (id, recipe_id, step_number, instruction, image_urls) VALUES`);

    const instValues = instructions.map((inst: any, idx: number) => {
      const comma = idx < instructions.length - 1 ? ',' : ';';
      return `  (${escapeSQL(inst.id)}, ${escapeSQL(inst.recipe_id)}, ${inst.step_number}, ${escapeSQL(inst.instruction)}, ${escapeSQL(inst.image_urls)})${comma}`;
    });
    lines.push(...instValues);
    lines.push('');
  }

  return lines.join('\n');
}

// Main
const args = process.argv.slice(2);
const recipeId = args.find(a => !a.startsWith('--'));
const remote = args.includes('--remote');

if (!recipeId) {
  console.error('Usage: npx tsx scripts/export-seed.ts <recipe-id> [--remote]');
  console.error('');
  console.error('List recipes with:');
  console.error(`  wrangler d1 execute ${DB_NAME} --local --command="SELECT id, title FROM recipes"`);
  process.exit(1);
}

console.log(generateRecipeSeed(recipeId, remote));
