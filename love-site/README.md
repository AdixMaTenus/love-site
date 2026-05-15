# Love Site — Для тебя 💕

Красивый интерактивный сайт-извинение с 24 фишками и серверлесс-бэкенд на Vercel.

## 🚀 Быстрый старт

### Три основные фишки (готовы к деплою):

1. **💕 Счётчик просмотров** (`api/visit.js`)
   - Отслеживает каждый раз когда она открывает сайт
   - Использует Vercel KV Store (бесплатно)

2. **📬 Telegram уведомление** (`api/notify.js`)
   - Тебе приходит сообщение когда она заходит
   - @BotFather + Telegram Bot API

3. **🎨 Красивое OG-превью** (`api/og.js`)
   - Когда отправишь ссылку — красивая картинка вместо серой заглушки
   - @vercel/og генерирует изображение на лету

## 📋 Что дальше

- [VERCEL_SETUP.md](./VERCEL_SETUP.md) — пошаговая инструкция по развертыванию
- [ARCHITECTURE.md](./ARCHITECTURE.md) — описание API и структуры проекта

## 🛠 Используемые технологии

- **Фронтенд**: Vanilla JS + CSS (Canvas, Web API)
- **Бэкенд**: Vercel Edge Functions (Node.js)
- **БД/Кеш**: Vercel KV Store (Redis)
- **Уведомления**: Telegram Bot API
- **OG**: @vercel/og

## 📝 Файлы проекта

```
api/
├── visit.js      → Счётчик просмотров
├── notify.js     → Telegram alerts
└── og.js         → Динамический preview

test.html        → Главная страница
vercel.json      → Конфигурация Vercel
package.json     → Зависимости
```

## 🔗 Ссылки

- [Vercel Docs](https://vercel.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots)
- [@vercel/og](https://vercel.com/docs/og-image-generation)

---

**Готово к развертыванию на Vercel!** 🎉

Запусти процесс: посмотри [VERCEL_SETUP.md](./VERCEL_SETUP.md)
