#!/bin/bash
cd "$(dirname "$0")" || exit
echo "Cleaning up any running background processes..."
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "Starting BlockSuite Editor Server (port 5173)..."
echo "Clearing Vite cache for BlockSuite..."
(cd blocksuite && rm -rf node_modules/.vite && npm run dev) &
BLOCKSUITE_PID=$!

echo "Starting Next.js App (port 3000)..."
cd simplify-app
echo "Clearing .next cache to prevent database errors..."
rm -rf .next
npm run dev

# If the user presses Ctrl+C, kill the background BlockSuite process too
trap "kill $BLOCKSUITE_PID" EXIT
