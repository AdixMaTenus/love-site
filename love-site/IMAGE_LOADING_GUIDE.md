# 📸 Система загрузки изображений — Image Loading System

## ✅ Что было исправлено

Добавлена **интеллектуальная система загрузки** которая гарантирует что фотографии загружаются даже при проблемах с сетью или неправильными путями при деплое в Vercel.

---

## 🎯 Как это работает

### Автоматическое определение окружения
```javascript
// На Vercel production
isProduction = true
// Приоритет: utro.jpg → public/utro.jpg → utro.png → public/utro.png

// На локальной машине / localhost
isProduction = false  
// Приоритет: public/utro.jpg → utro.jpg → public/utro.png → utro.png
```

### Retry-механизм
- **1-я попытка**: Основной вариант пути
- **2-я попытка**: Альтернативный путь (с `public/` или без)
- **3-я попытка**: PNG версия
- **4-я попытка**: PNG с `public/` префиксом
- **Если все неудачно**: Экспоненциальная задержка + повторить все заново

### Логирование
Откройте **DevTools** (F12) → **Console** чтобы увидеть детальный лог:

```
[ImageLoader] 🚀 Инициализация loader (production: false)
[ImageLoader] Найдено 5 изображений для загрузки
[ImageLoader] 🔍 Попытка загрузить: public/utro.jpg
[ImageLoader] ✅ Загружена фотография: public/utro.jpg
[ImageLoader] 🔍 Попытка загрузить: public/kofe.jpg
[ImageLoader] ✅ Загружена фотография: public/kofe.jpg
...
```

---

## 📁 Структура файлов

```
public/
  ├── utro.jpg      → Наше утро вместе
  ├── kofe.jpg      → С тобой даже кофе вкуснее
  ├── kino.jpg      → Наши вечера в кино
  ├── luna.jpg      → Луна светит только для нас
  └── vmeste.jpg    → Когда я с тобой — это рай
```

---

## 🧪 Тестирование

### Локально (npm run dev)
1. Откройте http://localhost:3000
2. Откройте DevTools (F12)
3. Перейдите в **Console**
4. Фильтруйте по `[ImageLoader]`
5. Вы должны видеть ✅ успешную загрузку всех 5 фотографий

### На Vercel (после deploy)
1. Откройте развернутый сайт
2. F12 → Console
3. Проверьте что изображения загружаются
4. При проблемах посмотрите логи IMAGE_LOADER в консоли

---

## ⚙️ Конфигурация

### Добавить новое изображение
Отредактируйте в `script.js`:

```javascript
const imageMap = {
  'public/utro.jpg': ['utro.jpg', 'public/utro.jpg', 'public/utro.png', 'utro.png'],
  'public/kofe.jpg': ['kofe.jpg', 'public/kofe.jpg', 'public/kofe.png', 'kofe.png'],
  // ДОБАВЬТЕ НОВОЕ ЗДЕСЬ:
  'public/novoe.jpg': ['novoe.jpg', 'public/novoe.jpg', 'public/novoe.png', 'novoe.png'],
};
```

Затем в `index.html`:
```html
<div class="gallery-slide">
  <img class="gallery-photo" src="public/novoe.jpg" alt="Описание" />
  <span class="gallery-emoji-fallback">✨</span>
</div>
```

---

## 🔧 Кэширование

**vercel.json** настроено для:
- **Изображения**: кэш на 1 год (`max-age=31536000, immutable`)
- **Остальное**: кэш на 1 час (`max-age=3600`)

Это гарантирует что фотографии загружаются очень быстро при повторном посещении.

---

## 🚨 Если что-то не работает

1. **Отройте DevTools** (F12)
2. Перейдите на **Console**
3. Прокрутите до запуска и посмотрите логи `[ImageLoader]`
4. Проверьте:
   - ✅ Все ли 5 фотографий загружены?
   - ❌ Есть ли ошибки 404?
   - ⏱ Есть ли таймауты?

---

## 📦 Структура IMAGE_LOADER

```javascript
IMAGE_LOADER = {
  init()              // Инициализирует систему
  isProduction()      // Возвращает true/false
  getImageVariants()  // Получить варианты путей
  isLoaded()          // Проверить загружено ли изображение
}
```

---

Все готово! 🎉 При следующем деплое в Vercel фотографии гарантированно загрузятся.
