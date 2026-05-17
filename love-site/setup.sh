#!/bin/bash

# 🚀 QUICK START SCRIPT для локальной разработки

echo "💕 Love Site — Setup Script"
echo "════════════════════════════════════"

# 1. Установка зависимостей
echo ""
echo "📦 Установляю зависимости..."
npm install

# 2. Создание .env.local
echo ""
echo "🔑 Создаю .env.local..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Скопировал .env.example → .env.local"
    echo "⚠️  Заполни значения в .env.local перед запуском!"
else
    echo "✅ .env.local уже существует"
fi

# 3. Git инициализация (если нужна)
if [ ! -d .git ]; then
    echo ""
    echo "🐙 Инициализирую Git..."
    git init
    git add .
    git commit -m "Initial commit: love site with Vercel API"
    echo "✅ Git инициализирован"
    echo ""
    echo "Далее:"
    echo "  1. Создай репо на GitHub"
    echo "  2. git remote add origin https://github.com/YOUR_USER/love-site.git"
    echo "  3. git branch -M main"
    echo "  4. git push -u origin main"
fi

echo ""
echo "════════════════════════════════════"
echo "✅ Setup завершен!"
echo ""
echo "📚 Дальше:"
echo "   1. Читай VERCEL_SETUP.md для инструкций"
echo "   2. Заполни .env.local переменными"
echo "   3. Запусти: npm run dev"
echo ""
