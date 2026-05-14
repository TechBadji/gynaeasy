#!/bin/sh
set -e

echo "[gynaeasy] Running prisma migrate deploy..."
./node_modules/.bin/prisma migrate deploy

echo "[gynaeasy] Starting Next.js..."
exec node server.js
