#!/bin/sh
set -e

echo "Starting MLBB Tournament System..."

# Push schema to PostgreSQL if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Applying database schema migrations..."
  npx prisma db push --skip-generate || echo "Database push warning: continuing..."
fi

exec "$@"
