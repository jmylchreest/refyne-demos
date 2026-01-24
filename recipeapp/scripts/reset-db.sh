#!/bin/bash
# Daily database reset script for Recipe App
# Drops all tables and re-applies migrations from scratch
#
# Usage: ./scripts/reset-db.sh <database-name>
#
# This script:
# 1. Extracts table names from CREATE TABLE statements in migrations
# 2. Drops all those tables
# 3. Re-applies all migrations (recreating schema + seed data)

set -e

DB_NAME=${1:?Usage: $0 <database-name>}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/../migrations"

echo "Resetting database: $DB_NAME"

# Extract table names from CREATE TABLE statements in migrations
TABLES=$(grep -hi "CREATE TABLE" "$MIGRATIONS_DIR"/*.sql | \
  sed -E 's/.*CREATE TABLE (IF NOT EXISTS )?([a-zA-Z_]+).*/\2/' | \
  sort -u)

if [ -z "$TABLES" ]; then
  echo "No tables found in migrations"
  exit 1
fi

echo "Tables to drop: $TABLES"

# Build DROP statements
DROP_SQL=""
for table in $TABLES; do
  DROP_SQL="${DROP_SQL}DROP TABLE IF EXISTS ${table}; "
done

# Also drop the D1 migrations tracking table to force re-apply
DROP_SQL="${DROP_SQL}DROP TABLE IF EXISTS _cf_KV; DROP TABLE IF EXISTS d1_migrations;"

echo "Dropping tables..."
npx wrangler d1 execute "$DB_NAME" --remote --command "$DROP_SQL"

echo "Applying migrations..."
npx wrangler d1 migrations apply "$DB_NAME" --remote

echo "Database reset complete"
