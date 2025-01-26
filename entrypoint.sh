#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Generating Prisma client..."
npx prisma generate

echo "Starting the application..."
exec "$@"