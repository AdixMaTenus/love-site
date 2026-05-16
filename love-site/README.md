# Love Site — Для тебя 💕

Красивый интерактивный сайт-извинение. **Полностью работает без зависимостей** — все интеграции опциональны.

## 🎉 Главная фишка: Никаких зависимостей!

Сайт **работает прямо сейчас**, даже без каких-то сервисов:

- ✅ **Без KV Store** → счётчик в памяти
- ✅ **Без Telegram** → уведомления логируются  
- ✅ **Без @vercel/og** → OG генерируется через SVG
- ✅ **Сайт всегда работает**, даже если что-то не настроено

## 🚀 Быстрый старт

### Вариант 1: Просто сайт (0 €)
```bash
npm install
vercel dev
# Готово! Сайт открыт на http://localhost:3000
```

### Вариант 2: + Telegram уведомления
1. Создай бота: [@BotFather](https://t.me/botfather)
2. Получи свой ID: [@userinfobot](https://t.me/userinfobot)
3. Добавь в `.env.local`:
   ```
   TELEGRAM_BOT_TOKEN=твой_токен
   TELEGRAM_CHAT_ID=твой_id
   ```
4. Перезагрузи сервер

### Вариант 3: + Счётчик с хранилищем
1. [Vercel Storage → KV](https://vercel.com/storage) → Create KV Store
2. Скопируй `KV_REST_API_URL` и `KV_REST_API_TOKEN`
3. Добавь в `.env.local`:
   ```
   KV_REST_API_URL=твой_url
   KV_REST_API_TOKEN=твой_токен
   ```

## 📋 Основные эндпоинты

| Эндпоинт | Описание | Зависит от |
|----------|---------|-----------|
| `GET /api/visit` | Счётчик просмотров | KV Store (опционально) |
| `POST /api/notify` | Telegram уведомление | Telegram (опционально) |
| `GET /api/og` | OG-превью | @vercel/og (опционально) |

## 📚 Документация

- [ARCHITECTURE.md](./ARCHITECTURE.md) — полное описание проекта и API
- [VERCEL_SETUP.md](./VERCEL_SETUP.md) — инструкция по деплою на Vercel
- [.env.example](./.env.example) — все доступные переменные окружения

## 🛠 Используемые технологии

- **Фронтенд**: Vanilla JS + CSS (Canvas, Web API)
- **Бэкенд**: Vercel Edge Functions (Node.js)
- **БД/Кеш**: Vercel KV Store (Redis) — опционально
- **Уведомления**: Telegram Bot API — опционально
- **OG**: @vercel/og — опционально

## 📁 Структура проекта

```
api/
├── visit.js      → Счётчик просмотров (KV или локально)
├── notify.js     → Telegram уведомления (опционально)
├── og.js         → OG-превью (SVG или @vercel/og)
└── _config.js    → Утилита для проверки конфигурации

index.html       → Главная страница
vercel.json      → Конфигурация Vercel
package.json     → Зависимостей практически нет!
.env.example     → Шаблон переменных окружения
ARCHITECTURE.md  → Полное описание архитектуры
```

## 🔍 Отладка

Проверить, какие сервисы включены:
```bash
curl http://localhost:3000/api/_config
```

Ответ покажет статус всех интеграций.

## 🚢 Деплой

### На Vercel (рекомендуется)
```bash
# Первый раз
vercel

# Дальше просто push на GitHub - автоматический деплой!
```

### Ручной деплой
```bash
vercel --prod
```

## 🔗 Полезные ссылки

- [Vercel Docs](https://vercel.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots)
- [Vercel Storage](https://vercel.com/storage)
- [@BotFather](https://t.me/botfather) — создать бота
- [@userinfobot](https://t.me/userinfobot) — получить свой ID

## 💡 Идеи для расширения

Смотри [ARCHITECTURE.md](./ARCHITECTURE.md) для примеров добавления новых фишек без дополнительных зависимостей!
- [@vercel/og](https://vercel.com/docs/og-image-generation)

---

**Готово к развертыванию на Vercel!** 🎉

Запусти процесс: посмотри [VERCEL_SETUP.md](./VERCEL_SETUP.md)
