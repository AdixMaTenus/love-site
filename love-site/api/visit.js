/**
 * API endpoint для счётчика просмотров
 * Использует Vercel KV Store или Upstash Redis
 * 
 * Переменные окружения:
 * - KV_REST_API_URL
 * - KV_REST_API_TOKEN
 */

export default async function handler(req, res) {
  // Только GET запросы
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;

    if (!kvUrl || !kvToken) {
      return res.status(500).json({
        error: 'KV Store не настроен',
        visits: 0
      });
    }

    // Получаем текущее значение счётчика
    const response = await fetch(`${kvUrl}/get/visits`, {
      headers: {
        Authorization: `Bearer ${kvToken}`,
      },
    });

    const data = await response.json();
    let currentVisits = parseInt(data.result || 0);

    // Увеличиваем счётчик на 1
    currentVisits += 1;

    // Сохраняем обновленное значение (с TTL опционально)
    await fetch(`${kvUrl}/set/visits/${currentVisits}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
      },
    });

    // Возвращаем новое значение
    res.status(200).json({
      visits: currentVisits,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Visit counter error:', error);
    res.status(500).json({
      error: 'Не удалось обновить счётчик',
      visits: 0
    });
  }
}
