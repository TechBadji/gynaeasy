#!/bin/sh
set -e

echo "[gynaeasy] Running prisma migrate deploy..."
node ./node_modules/prisma/build/index.js migrate deploy

echo "[gynaeasy] Starting Next.js..."
exec node server.js
