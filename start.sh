#!/bin/sh
npx prisma db push --accept-data-loss
exec node server.js
