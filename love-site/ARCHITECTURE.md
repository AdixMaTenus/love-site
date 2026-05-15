# 🎨 Архитектура проекта

## Структура файлов

```
.
├── api/                          # Vercel Edge Functions
│   ├── visit.js                 # 🔴 Счётчик просмотров (фишка #13)
│   ├── notify.js                # 🔴 Telegram уведомление (фишка #14)
│   └── og.js                    # 🔴 Динамическое OG-превью (фишка #18)
│
├── public/                       # Статические файлы
│   └── (твои картинки, музыка и т.д.)
│
├── test.html                     # Главная страница
├── package.json                  # Зависимости
├── vercel.json                   # Конфигурация Vercel
├── .env.example                  # Шаблон переменных окружения
├── VERCEL_SETUP.md              # Этот файл
└── README.md                     # Для GitHub (опционально)
```

---

## API Endpoints

### `GET /api/visit`
Увеличивает счётчик просмотров и возвращает текущее значение.

**Response:**
```json
{
  "visits": 42,
  "timestamp": "2026-05-16T10:30:00.000Z"
}
```

**Использование в JS:**
```javascript
const res = await fetch('/api/visit');
const { visits } = await res.json();
console.log(`Просмотров: ${visits}`);
```

---

### `POST /api/notify`
Отправляет уведомление в Telegram.

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
  "message": "Уведомление отправлено",
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

---

### `GET /api/og`
Генерирует динамическое OG-изображение.

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

---

## Переменные окружения

Скопируй `.env.example` в `.env.local` для локальной разработки:

```bash
cp .env.example .env.local
```

Заполни значения:

| Переменная | Источник | Описание |
|-----------|----------|---------|
| `KV_REST_API_URL` | Vercel Storage → KV | URL API KV Store |
| `KV_REST_API_TOKEN` | Vercel Storage → KV | Токен доступа KV Store |
| `TELEGRAM_BOT_TOKEN` | @BotFather в Telegram | Токен бота |
| `TELEGRAM_CHAT_ID` | getUpdates API | Твой ID чата с ботом |
| `SITE_URL` | Vercel | https://твой-домен.com |

---

## Как добавить ещё фишек

### Фишка #15: Сохранение ответа в БД

```javascript
// api/forgiven.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { answer, timestamp } = req.body;
    
    // Сохрани в KV Store
    const key = `answer:${Date.now()}`;
    await kv.set(key, JSON.stringify({ answer, timestamp }));
    
    res.json({ success: true });
  }
}
```

### Фишка #16: Email при первом визите

Используй **Resend** (бесплатный tier):
```javascript
// api/email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  const { email } = req.body;
  
  await resend.emails.send({
    from: 'noreply@love-site.com',
    to: email,
    subject: 'Она открыла сайт 💕',
    html: '<p>Твоя страница уже в действии!</p>'
  });
}
```

### Фишка #18: OG с её фото

Модифицируй `api/og.js` — добавь параметр для картинки:

```javascript
// api/og.js
const { image = 'https://example.com/photo.jpg' } = req.query;

// В JSX:
<img src={image} style={{ width: 200, borderRadius: 12 }} />
```

---

## Локальная разработка

### Через Vercel CLI:

```bash
# Установи CLI
npm i -g vercel

# Запусти локальный dev server
vercel dev

# Заходи на http://localhost:3000
```

Это эмулирует окружение Vercel локально (включая API).

---

## Деплой

### Автоматический (рекомендуется)
Когда запушишь в `main` branch на GitHub — Vercel автоматически перестроит и развернёт.

### Ручной
```bash
vercel --prod
```

---

## Мониторинг

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
