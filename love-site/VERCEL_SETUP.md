# 💕 Развертывание на Vercel

## Шаг 1: Инициализируй проект GitHub

```bash
# Инициализируй Git (если ещё не сделал)
git init
git add .
git commit -m "Initial commit: love site with 3 core features"

# Создай репо на GitHub (через веб)
# и добавь remote
git remote add origin https://github.com/YOUR_USERNAME/love-site.git
git branch -M main
git push -u origin main
```

## Шаг 2: Подключи Vercel

1. Перейди на [vercel.com](https://vercel.com)
2. Войди через GitHub аккаунт
3. Нажми "New Project" → "Import Git Repository"
4. Выбери репо `love-site`

## Шаг 3: Настрой Vercel KV Store

KV Store используется для счётчика просмотров (фишка #13).

### Создание KV Store:
1. В Vercel dashboard → Storage → "Create" → KV
2. Дай ему имя типа `love-site-kv`
3. Выбери регион (рекомендую самый близкий к тебе)
4. Подтверди

### Подключение в проект:
1. После создания KV → копируй код для подключения
2. В Vercel dashboard твоего проекта → Settings → Environment Variables
3. Добавь из `.env.example`:
   - `KV_REST_API_URL` ← скопируй из KV
   - `KV_REST_API_TOKEN` ← скопируй из KV

## Шаг 4: Telegram Bot (для фишки #14)

### Создание бота:
1. Открой Telegram и найди **@BotFather**
2. Отправь `/newbot`
3. Дай боту имя типа `LoveSiteBot`
4. Дай ему username типа `love_site_bot_USERNAME`
5. Скопируй токен, который он выдал

### Получение Chat ID:
1. Создай новый чат с ботом
2. Отправь ему `/start`
3. Перейди на `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   (замени `<YOUR_TOKEN>` на токен от @BotFather)
4. Найди `"chat":{"id":123456789}` — это твой Chat ID

### В Vercel:
Settings → Environment Variables, добавь:
- `TELEGRAM_BOT_TOKEN` ← токен от @BotFather
- `TELEGRAM_CHAT_ID` ← твой Chat ID

## Шаг 5: Установи пакеты и задеплой

```bash
# Локально (опционально для проверки)
npm install

# Отправь в GitHub
git add .
git commit -m "Add environment variables"
git push

# Vercel автоматически развернёт новую версию
# (смотри в dashboard)
```

## ✅ Готово!

Твой сайт теперь:
- ✨ Отправляет тебе уведомление когда она откроет сайт
- 📊 Считает просмотры
- 🎨 Показывает красивое OG-превью в соцсетях

---

## 🔧 Что дальше

Когда захочешь добавить ещё фишек:

**Фишка #15** — Сохранение ответа в БД
**Фишка #16** — Email при первом визите
**Фишка #17** — Гостевая книга
**Фишка #19-24** — Wow-механики (голос, карта, Spotify...)

Накидаю код для любой из них.

---

## 🐛 Troubleshooting

### "404 на /api/visit"
- Убедись, что файлы в папке `api/` (не в `public/`)
- Перегрузи проект на Vercel

### "Telegram сообщение не приходит"
- Проверь `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` в env vars
- Убедись, что отправил `/start` боту

### "KV Store не подключается"
- Проверь `KV_REST_API_URL` и `KV_REST_API_TOKEN`
- Убедись, что KV создан в том же Vercel проекте

---

**Нужна помощь?** Загляни в документацию:
- Vercel: https://vercel.com/docs
- @vercel/og: https://vercel.com/docs/og-image-generation
