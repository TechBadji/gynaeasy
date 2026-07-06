#!/bin/sh
set -e

PRISMA="node ./node_modules/prisma/build/index.js"

echo "[gynaeasy] Running prisma db push..."
$PRISMA db push --accept-data-loss

echo "[gynaeasy] Starting Next.js..."
exec node server.js
