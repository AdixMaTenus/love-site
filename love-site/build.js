#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✅ Created public/ directory');
}

// Copy index.html to public/
const sourceFile = path.join(__dirname, 'index.html');
const destFile = path.join(publicDir, 'index.html');

try {
  fs.copyFileSync(sourceFile, destFile);
  console.log('✅ Copied index.html to public/index.html');
} catch (error) {
  console.error('❌ Error copying index.html:', error.message);
  process.exit(1);
}

console.log('✅ Build complete!');
