# 🎨 Архитектура проекта

## 🎉 Кратко: Никаких зависимостей!

Сайт **полностью работает бесплатно** и не требует никаких сервисов. Все интеграции опциональны:
- ✅ Без KV Store → счётчик работает в памяти
- ✅ Без Telegram → уведомления логируются
- ✅ Без @vercel/og → OG превью генерируется через SVG
- ✅ **Сайт всегда доступен**, даже без одного сервиса

---

## Структура файлов

```
.
├── api/                          # Vercel Edge Functions (опциональные интеграции)
│   ├── visit.js                 # 📊 Счётчик просмотров (KV или локально)
│   ├── notify.js                # 🔔 Telegram уведомления (опционально)
│   └── og.js                    # 🖼️ OG-превью (SVG или @vercel/og)
│
├── public/                       # Статические файлы
│   └── (картинки, музыка и т.д.)
│
├── index.html                    # Главная страница
├── package.json                  # Зависимостей нет!
├── vercel.json                   # Конфигурация Vercel
├── .env.example                  # Примеры переменных окружения
├── ARCHITECTURE.md               # Этот файл
├── VERCEL_SETUP.md              # Инструкции для Vercel
└── README.md                     # Для GitHub (опционально)
```

---

## API Endpoints

### `GET /api/visit`
**Счётчик просмотров** — работает с KV Store если настроен, иначе локально.

**Response:**
```json
{
  "visits": 42,
  "timestamp": "2026-05-16T10:30:00.000Z",
  "storage": "vercel-kv"  // или "local"
}
```

**Использование в JS:**
```javascript
const res = await fetch('/api/visit');
const { visits } = await res.json();
console.log(`Просмотров: ${visits}`);
```

**Настройка:**
- Без переменных → счётчик в памяти (сбросится при перезагрузке)
- С `KV_REST_API_URL` и `KV_REST_API_TOKEN` → персистентное хранилище

---

### `POST /api/notify`
**Telegram уведомления** — опционально. Если не настроено, просто логирует.

**Request body (опционально):**
```json
{
  "message": "💕 Она открыла сайт!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Уведомление отправлено или залогировано",
  "debug": false,
  "messageId": 12345
}
```

**Использование в JS:**
```javascript
await fetch('/api/notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: '💕 Она только что зашла!' })
});
```

**Настройка:**
- Без переменных → уведомления логируются на сервере
- С `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` → отправляет в Telegram
- `TELEGRAM_DEBUG=true` → все равно логирует, не отправляет

---

### `GET /api/og`
**Динамическое OG-превью** — работает SVG по умолчанию, или @vercel/og если установлен.

**Query parameters:**
- `title` — заголовок (default: "💕")
- `subtitle` — подзаголовок (default: "Я тебя люблю")

**Пример:**
```
/api/og?title=Привет&subtitle=Как дела?
```

**Использование в HTML:**
```html
<meta property="og:image" content="/api/og?title=💕&subtitle=Я%20тебя%20люблю" />
```

**Форматы:**
- Без @vercel/og → SVG (всегда работает)
- С @vercel/og → красивые PNG (если `USE_VERCEL_OG=true`)

---

## Переменные окружения

**Все переменные опциональны!** Сайт работает и без них.

### Локальная разработка

Скопируй `.env.example` в `.env.local`:

```bash
cp .env.example .env.local
```

### На Vercel

Переменные можно добавить через Dashboard → Settings → Environment Variables.

### Таблица переменных

| Переменная | По умолчанию | Описание | Где получить |
|-----------|-------------|---------|-------------|
| `KV_REST_API_URL` | — | URL для KV Store | [Vercel Storage](https://vercel.com/storage) |
| `KV_REST_API_TOKEN` | — | Токен KV Store | [Vercel Storage](https://vercel.com/storage) |
| `TELEGRAM_BOT_TOKEN` | — | Токен Telegram бота | [@BotFather](https://t.me/botfather) |
| `TELEGRAM_CHAT_ID` | — | Твой ID в Telegram | [@userinfobot](https://t.me/userinfobot) |
| `TELEGRAM_DEBUG` | `false` | Логировать вместо отправки | — |
| `INITIAL_VISITS` | `0` | Начальное значение счётчика | Любое число |
| `USE_VERCEL_OG` | `false` | Использовать @vercel/og | `true` или `false` |
| `SITE_URL` | — | URL твоего сайта | Твой домен |

---

## 🚀 Быстрый старт

### Вариант 1: Только сайт (0 €/месяц)
```bash
# Клонируй и запусти
git clone <repo>
npm install
vercel dev
```
**Сайт работает.** Больше ничего не нужно.

### Вариант 2: + Telegram уведомления
1. Создай бота: [@BotFather](https://t.me/botfather) → `/newbot`
2. Получи свой ID: [@userinfobot](https://t.me/userinfobot)
3. Добавь в `.env.local`:
   ```
   TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
   TELEGRAM_CHAT_ID=987654321
   ```
4. Перезагрузи сервер

### Вариант 3: + Счётчик с хранилищем
1. Зайди на [Vercel Storage → KV](https://vercel.com/storage)
2. Создай KV Store
3. Скопируй `KV_REST_API_URL` и `KV_REST_API_TOKEN`
4. Добавь в `.env.local` или в Vercel Dashboard

### Вариант 4: Всё включено
Комбинируй Вариант 2 + 3, плюс:
```bash
npm install @vercel/og
# Добавь в .env.local:
# USE_VERCEL_OG=true
```

---

## Как добавить свои фишки

### Фишка: Сохранение ответа в БД

```javascript
// api/answer.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { answer, timestamp } = req.body;
    
    // Сохрани в KV Store (если настроен)
    const kvUrl = process.env.KV_REST_API_URL;
    if (kvUrl) {
      const key = `answer:${Date.now()}`;
      await fetch(`${kvUrl}/set/${key}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
        body: JSON.stringify({ answer, timestamp }),
      });
    }
    
    // Или просто логируй
    console.log('Answer:', { answer, timestamp });
    
    res.json({ success: true });
  }
}
```

### Фишка: Email (без зависимостей)

```javascript
// api/email.js
export default async function handler(req, res) {
  const { email, name } = req.body;
  
  // Просто логируй (или интегрируй любой бесплатный сервис)
  console.log('Email запрос:', { email, name });
  
  res.json({ success: true, message: 'Запрос получен' });
}
```

---

## Локальная разработка

### Через Vercel CLI

```bash
# Установи CLI
npm i -g vercel

# Запусти dev server
vercel dev

# Сайт доступен на http://localhost:3000
```

Это эмулирует окружение Vercel локально (включая API endpoints).

---

## Деплой на Vercel

### Способ 1: Автоматический (рекомендуется)
1. Залей репо на GitHub
2. Зайди на [vercel.com](https://vercel.com)
3. Нажми "Import Project"
4. Выбери репо → Deploy

При каждом push в main — автоматический деплой!

### Способ 2: Ручной деплой

```bash
vercel --prod
```

---

## Зачем нужны переменные окружения?

| Переменная | Даёт | Стоимость |
|-----------|------|---------|
| Ничего | ✅ Рабочий сайт | **0 €** |
| KV Store | ✅ Персистентный счётчик | **Бесплатный tier** |
| Telegram Bot | ✅ Уведомления | **0 €** (Telegram бесплатный) |
| @vercel/og | ✅ Красивые OG картинки | **0 €** (npm пакет) |

**Все необязательны, сайт работает в любом случае!**

---

## Troubleshooting

### Счётчик сбросился
Если используешь локальное хранилище (без KV), счётчик сбросится при перезагрузке сервера. Это нормально.

**Решение:** Настрой KV Store (см. Вариант 3 выше).

### Telegram не отправляет
Проверь:
1. Токен верный
2. Chat ID верный
3. Бот не заблокирован
4. Логи сервера для ошибок

**Сайт всё равно будет работать!**

### OG превью не красивые
Если используется SVG fallback (без @vercel/og), это нормально.

**Решение:** Установи @vercel/og и убедись, что `USE_VERCEL_OG=true`.

---

## Дальнейшее развитие

### Идеи для новых фишек
- Форма обратной связи с сохранением в KV
- Музыкальный плеер
- Фотогалерея
- Счетчик дней вместе
- Анимированный фон
- Список причин, почему я тебя люблю

Все это можно добавить без дополнительных зависимостей!

### Логи:
1. Vercel dashboard → твой проект → Deployments
2. Нажми на deployment → Function logs

### Ошибки:
1. Правая сторона dashboard → "Analytics"
2. Или смотри Console в DevTools браузера

---

## Безопасность

- 🔒 Никогда не коммитьте `.env` в Git
- 🔐 Используй переменные окружения для всех секретов
- 🛡️ Vercel KV автоматически зашифрован
- ⚠️ Rate-limit: Telegram Bot API ограничивает до 30 сообщений/сек

---

**Готово к развертыванию!** 🚀
