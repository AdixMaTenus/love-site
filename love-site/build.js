#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✅ Created public/ directory');
}

// List of files to copy to public/
const filesToCopy = ['index.html', 'style.css', 'script.js'];

filesToCopy.forEach((file) => {
  const sourceFile = path.join(__dirname, file);
  const destFile = path.join(publicDir, file);

  // Check if source file exists
  if (!fs.existsSync(sourceFile)) {
    console.warn(`⚠️  Source file not found: ${file}`);
    return;
  }

  try {
    fs.copyFileSync(sourceFile, destFile);
    console.log(`✅ Copied ${file} to public/${file}`);
  } catch (error) {
    console.error(`❌ Error copying ${file}:`, error.message);
    process.exit(1);
  }
});

console.log('✅ Build complete!');
