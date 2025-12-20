#!/bin/sh
set -e

echo "Running database migrations..."
node /app/node_modules/prisma/build/index.js migrate deploy --schema=./prisma/schema.prisma

echo "Starting application..."
exec node dist/src/main.js
