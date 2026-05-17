#!/usr/bin/env node
/**
 * build.js — копирует фронтенд-файлы из корня в public/
 *
 * ВАЖНО: Всегда редактируй файлы в КОРНЕ проекта (index.html, style.css, script.js).
 * build.js автоматически копирует их в public/ при деплое на Vercel.
 * Никогда не редактируй файлы напрямую в папке public/ — они перезапишутся.
 */

const fs   = require('fs');
const path = require('path');

const root      = __dirname;
const publicDir = path.join(root, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✅ Created public/');
}

const filesToCopy = ['index.html', 'style.css', 'script.js'];

let hasError = false;
for (const file of filesToCopy) {
  const src  = path.join(root, file);
  const dest = path.join(publicDir, file);

  if (!fs.existsSync(src)) {
    console.warn(`⚠️  Не найден: ${file} — пропускаю`);
    continue;
  }

  try {
    fs.copyFileSync(src, dest);
    const size = (fs.statSync(dest).size / 1024).toFixed(1);
    console.log(`✅ ${file} → public/${file} (${size} KB)`);
  } catch (err) {
    console.error(`❌ Ошибка копирования ${file}:`, err.message);
    hasError = true;
  }
}

const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const existingImages = fs.existsSync(publicDir)
  ? fs.readdirSync(publicDir).filter(f => imageExts.includes(path.extname(f).toLowerCase()))
  : [];
if (existingImages.length) {
  console.log(`📸 Фотографий в public/: ${existingImages.join(', ')}`);
} else {
  console.warn('⚠️  В public/ нет фотографий. Добавь utro.jpg, kofe.jpg и т.д.');
}

if (hasError) process.exit(1);
console.log('\n✅ Build complete!');
console.log('💡 Редактируй только файлы в КОРНЕ проекта, не в public/');