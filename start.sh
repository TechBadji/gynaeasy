#!/bin/sh
set -e

PRISMA="node ./node_modules/prisma/build/index.js"

echo "[gynaeasy] Running prisma migrate deploy..."
$PRISMA migrate deploy

echo "[gynaeasy] Starting Next.js..."
exec node server.js
