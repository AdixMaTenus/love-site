/**
 * API endpoint для отправки уведомления в Telegram
 * Опционально - если Telegram не настроен, просто логирует сообщение
 * 
 * Переменные окружения (опциональны):
 * - TELEGRAM_BOT_TOKEN
 * - TELEGRAM_CHAT_ID
 * - TELEGRAM_DEBUG (если true, логирует вместо отправки)
 */

export default async function handler(req, res) {
  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const debugMode = process.env.TELEGRAM_DEBUG === 'true';

    // Получаем данные из запроса
    const { message = '💕 Она открыла сайт!' } = req.body;

    // Формируем информацию о сообщении
    const timestamp = new Date().toLocaleString('ru-RU');
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.headers['x-real-ip'] || 'unknown';
    
    const telegramMessage = `
${message}

📱 User Agent: ${userAgent}
⏰ Время: ${timestamp}
🌍 IP: ${ip}
    `.trim();

    // Если Telegram не настроен или режим отладки
    if (!botToken || !chatId || debugMode) {
      console.log('📨 [Notify - Debug Mode]', {
        message,
        timestamp,
        userAgent,
        ip,
        telegramConfigured: !!(botToken && chatId),
      });

      return res.status(200).json({
        success: true,
        message: debugMode ? 'Debug mode - уведомление залогировано' : 'Telegram не настроен - уведомление залогировано',
        debug: true,
        messageId: null,
      });
    }

    // Отправляем сообщение через Telegram Bot API
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
          parse_mode: 'HTML',
        }),
      }
    );

    const telegramData = await telegramResponse.json();

    if (!telegramData.ok) {
      console.error('Telegram error:', telegramData);
      // Даже если ошибка, считаем это успехом (бот может быть просто заблокирован)
      return res.status(200).json({
        success: true,
        message: 'Запрос обработан (может быть, бот заблокирован или неверный токен)',
        debug: true,
        telegramError: telegramData.description,
        messageId: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Уведомление отправлено',
      messageId: telegramData.result.message_id,
      debug: false,
    });

  } catch (error) {
    console.error('Notify error:', error);
    // Даже при ошибке возвращаем успех - чтобы не ломать фронтенд
    res.status(200).json({
      success: true,
      message: 'Запрос обработан (ошибка при отправке залогирована)',
      error: error.message,
      debug: true,
      messageId: null,
    });
  }
}
