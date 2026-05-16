/**
 * Утилита для проверки доступных сервисов
 * Помогает отладить, какие интеграции работают
 */

export function getConfig() {
  return {
    // KV Store configuration
    kv: {
      enabled: !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
      url: process.env.KV_REST_API_URL || null,
      hasToken: !!process.env.KV_REST_API_TOKEN,
    },

    // Telegram Bot configuration
    telegram: {
      enabled: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
      hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
      hasChatId: !!process.env.TELEGRAM_CHAT_ID,
      debugMode: process.env.TELEGRAM_DEBUG === 'true',
    },

    // OG Image generation
    og: {
      useVercelOg: process.env.USE_VERCEL_OG === 'true',
      fallbackToSvg: true,
    },

    // Visit counter
    visit: {
      initialCount: parseInt(process.env.INITIAL_VISITS || '0'),
      storage: process.env.KV_REST_API_URL ? 'vercel-kv' : 'local',
    },

    // General
    siteUrl: process.env.SITE_URL || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development',
  };
}

/**
 * Для отладки - показывает, какие сервисы доступны
 */
export function getConfigStatus() {
  const config = getConfig();
  return {
    'Vercel KV Store': config.kv.enabled ? '✅ Включено' : '❌ Отключено',
    'Telegram Bot': config.telegram.enabled ? '✅ Включено' : (config.telegram.debugMode ? '⚠️ Debug mode' : '❌ Отключено'),
    'OG Image Generation': config.og.useVercelOg ? '✅ @vercel/og' : '✅ SVG Fallback',
    'Visit Counter Storage': config.visit.storage === 'vercel-kv' ? '📦 Vercel KV' : '🧠 Local Memory',
    'Environment': config.environment,
  };
}

/**
 * Обработчик для /api/config (отладка)
 * Показывает конфигурацию сервиса
 */
export default function configHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Для безопасности - не показываем чувствительные данные
  const config = getConfig();
  const sanitized = {
    kv: {
      enabled: config.kv.enabled,
      hasUrl: !!config.kv.url,
      hasToken: config.kv.hasToken,
    },
    telegram: {
      enabled: config.telegram.enabled,
      hasToken: config.telegram.hasToken,
      hasChatId: config.telegram.hasChatId,
      debugMode: config.telegram.debugMode,
    },
    og: config.og,
    visit: config.visit,
    environment: config.environment,
  };

  res.status(200).json({
    config: sanitized,
    status: getConfigStatus(),
  });
}
