/**
 * API endpoint для счётчика просмотров
 * Работает с Vercel KV Store если настроен, иначе использует локальное хранилище (переменная окружения)
 * 
 * Переменные окружения (опциональны):
 * - KV_REST_API_URL
 * - KV_REST_API_TOKEN
 * - INITIAL_VISITS (для локального счётчика, по умолчанию 0)
 */

// Простое локальное хранилище в памяти для локальной разработки
let localVisitCount = parseInt(process.env.INITIAL_VISITS || '0');

async function getVisitsFromKV() {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    return null;
  }

  try {
    const response = await fetch(`${kvUrl}/get/visits`, {
      headers: {
        Authorization: `Bearer ${kvToken}`,
      },
    });
    const data = await response.json();
    return parseInt(data.result || 0);
  } catch (error) {
    console.error('KV read error:', error);
    return null;
  }
}

async function setVisitsToKV(count) {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    return false;
  }

  try {
    await fetch(`${kvUrl}/set/visits/${count}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
      },
    });
    return true;
  } catch (error) {
    console.error('KV write error:', error);
    return false;
  }
}

export default async function handler(req, res) {
  // Только GET запросы
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let currentVisits;

    // Пытаемся получить из KV Store
    const kvVisits = await getVisitsFromKV();
    if (kvVisits !== null) {
      currentVisits = kvVisits;
    } else {
      // Используем локальное хранилище
      currentVisits = localVisitCount;
    }

    // Увеличиваем счётчик на 1
    currentVisits += 1;

    // Пытаемся сохранить в KV Store
    const saved = await setVisitsToKV(currentVisits);
    
    // Если KV не работает, сохраняем локально
    if (!saved) {
      localVisitCount = currentVisits;
    }

    // Возвращаем новое значение
    res.status(200).json({
      visits: currentVisits,
      timestamp: new Date().toISOString(),
      storage: kvVisits !== null ? 'vercel-kv' : 'local',
    });

  } catch (error) {
    console.error('Visit counter error:', error);
    res.status(500).json({
      error: 'Не удалось обновить счётчик',
      visits: 0,
      timestamp: new Date().toISOString(),
    });
  }
}
