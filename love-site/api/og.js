/**
 * API endpoint для генерации OG-превью
 * Использует @vercel/og для динамического создания изображений
 * 
 * Переменные окружения:
 * - SITE_URL (опционально)
 */

import { ImageResponse } from '@vercel/og';

export default async function handler(req, res) {
  try {
    // Параметры из query string
    const { title = '💕', subtitle = 'Я тебя люблю' } = req.query;

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          {/* Фоновые декоративные элементы */}
          <div
            style={{
              position: 'absolute',
              width: 300,
              height: 300,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              top: -100,
              right: -100,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 200,
              height: 200,
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%',
              bottom: -50,
              left: -50,
            }}
          />

          {/* Основной контент */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '30px',
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Заголовок */}
            <div
              style={{
                fontSize: 80,
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                margin: 0,
              }}
            >
              {title}
            </div>

            {/* Подзаголовок */}
            <div
              style={{
                fontSize: 48,
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '500',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                margin: 0,
              }}
            >
              {subtitle}
            </div>

            {/* Нижний текст */}
            <div
              style={{
                fontSize: 24,
                color: 'rgba(255, 255, 255, 0.8)',
                marginTop: '20px',
                fontStyle: 'italic',
              }}
            >
              Открой это сообщение 💌
            </div>
          </div>

          {/* Логотип или дополнительная информация */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: 40,
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            made with 💜
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

  } catch (error) {
    console.error('OG generation error:', error);
    res.status(500).send('Could not generate OG image');
  }
}

export const config = {
  runtime: 'edge',
};
