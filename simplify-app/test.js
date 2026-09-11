const fs = require('fs');
const fetch = require('node-fetch');

async function run() {
  const res = await fetch('http://localhost:3000/api/debug');
  const data = await res.json();
  const jsonStr = data.json;
  
  if (!jsonStr) {
    console.log("No JSON found");
    return;
  }
  
  const state = JSON.parse(jsonStr);
  const blocks = Object.values(state).filter(b => b && b.sys);
  
  // Look for any blocks related to tables
  const tableBlocks = blocks.filter(b => b.sys.flavour === 'affine:database');
  console.log("Found database blocks:", tableBlocks.length);
  
  if (tableBlocks.length > 0) {
    console.log(JSON.stringify(tableBlocks[0], null, 2));
  }
}

run();
