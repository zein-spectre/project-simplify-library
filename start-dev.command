#!/bin/bash
cd "$(dirname "$0")" || exit
echo "Starting BlockSuite Editor Server (port 5173)..."
(cd blocksuite && npm run dev) &
BLOCKSUITE_PID=$!

echo "Starting Next.js App (port 3000)..."
cd simplify-app
echo "Clearing .next cache to prevent database errors..."
rm -rf .next
npm run dev

# If the user presses Ctrl+C, kill the background BlockSuite process too
trap "kill $BLOCKSUITE_PID" EXIT
