#!/bin/sh
set -e

PRISMA="node ./node_modules/prisma/build/index.js"

echo "[gynaeasy] Baselining existing migrations..."
$PRISMA migrate resolve --applied "20260320121446_sync_schema" 2>/dev/null || true
$PRISMA migrate resolve --applied "20260320170312_init_advertisement" 2>/dev/null || true

echo "[gynaeasy] Running prisma migrate deploy..."
$PRISMA migrate deploy

echo "[gynaeasy] Starting Next.js..."
exec node server.js
