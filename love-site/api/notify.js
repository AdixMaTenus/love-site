/**
 * API endpoint для отправки уведомления в Telegram
 * 
 * Переменные окружения:
 * - TELEGRAM_BOT_TOKEN
 * - TELEGRAM_CHAT_ID
 */

export default async function handler(req, res) {
  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(500).json({
        error: 'Telegram не настроен'
      });
    }

    // Получаем данные из запроса
    const { message = '💕 Она открыла сайт!' } = req.body;

    // Формируем сообщение с информацией
    const timestamp = new Date().toLocaleString('ru-RU');
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    const telegramMessage = `
${message}

📱 User Agent: ${userAgent}
⏰ Время: ${timestamp}
🌍 IP: ${req.headers['x-forwarded-for']?.split(',')[0] || 'unknown'}
    `.trim();

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
      return res.status(500).json({
        error: 'Не удалось отправить уведомление'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Уведомление отправлено',
      messageId: telegramData.result.message_id,
    });

  } catch (error) {
    console.error('Notify error:', error);
    res.status(500).json({
      error: 'Ошибка при отправке уведомления'
    });
  }
}
