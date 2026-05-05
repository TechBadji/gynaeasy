#!/bin/sh
set -e

echo "Running prisma db push..."
node_modules/.bin/prisma db push --accept-data-loss --schema=prisma/schema.prisma

echo "Running seed if DB is empty..."
USER_COUNT=$(node_modules/.bin/prisma migrate status 2>/dev/null || echo "0")
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => {
  if (count === 0) {
    console.log('DB empty, running seed...');
    const { execSync } = require('child_process');
    execSync('node_modules/.bin/tsx prisma/seed.ts', { stdio: 'inherit' });
  } else {
    console.log('DB already seeded (' + count + ' users), skipping.');
  }
  return prisma.\$disconnect();
}).catch(e => { console.error(e); process.exit(0); });
"

echo "Starting Next.js..."
exec node server.js
