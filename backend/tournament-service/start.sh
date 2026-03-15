#!/bin/sh
echo "Starting tournament service..."
echo "Waiting for database to be ready..."
sleep 3
echo "Running seed..."
node dist/seed.js || echo "Seed skipped or failed (may already be seeded)"
echo "Starting main application..."
node dist/main.js
