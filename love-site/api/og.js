/**
 * API endpoint для генерации OG-превью
 * Использует простой SVG без зависимостей (@vercel/og опционально, но не требуется)
 * 
 * Query параметры:
 * - title: заголовок (default: 💕)
 * - subtitle: подзаголовок (default: Я тебя люблю)
 * 
 * Переменные окружения (опциональны):
 * - SITE_URL
 * - USE_VERCEL_OG (если true и установлен @vercel/og, использует его)
 */

// Попытаемся использовать @vercel/og если он установлен и разрешено
let ImageResponse = null;
let useVercelOg = process.env.USE_VERCEL_OG === 'true';

if (useVercelOg) {
  try {
    const ogModule = await import('@vercel/og');
    ImageResponse = ogModule.ImageResponse;
  } catch (error) {
    console.log('@vercel/og не установлен, используем SVG fallback');
    useVercelOg = false;
  }
}

async function generateSvgImage(title, subtitle) {
  // Экранируем специальные символы для SVG
  const escapeXml = (str) => {
    return String(str).replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  const titleEscaped = escapeXml(title);
  const subtitleEscaped = escapeXml(subtitle);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#grad1)"/>
  
  <!-- Decorative circles -->
  <circle cx="1050" cy="-70" r="150" fill="rgba(255, 255, 255, 0.1)"/>
  <circle cx="-50" cy="580" r="100" fill="rgba(255, 255, 255, 0.05)"/>
  
  <!-- Title -->
  <text x="600" y="220" font-size="120" font-weight="bold" text-anchor="middle" 
        fill="white" filter="url(#shadow)" font-family="Arial, sans-serif">
    ${titleEscaped}
  </text>
  
  <!-- Subtitle -->
  <text x="600" y="350" font-size="72" text-anchor="middle" 
        fill="rgba(255, 255, 255, 0.9)" filter="url(#shadow)" font-family="Arial, sans-serif" font-weight="500">
    ${subtitleEscaped}
  </text>
  
  <!-- Bottom text -->
  <text x="600" y="450" font-size="36" text-anchor="middle" 
        fill="rgba(255, 255, 255, 0.8)" font-family="Arial, sans-serif" font-style="italic">
    Открой это сообщение 💌
  </text>
  
  <!-- Footer -->
  <text x="1100" y="600" font-size="16" text-anchor="end" 
        fill="rgba(255, 255, 255, 0.6)" font-family="Arial, sans-serif">
    made with 💜
  </text>
</svg>`;

  return svg;
}

export default async function handler(req, res) {
  try {
    // Параметры из query string
    const { title = '💕', subtitle = 'Я тебя люблю' } = req.query;

    // Если доступен @vercel/og, используем его
    if (ImageResponse && useVercelOg) {
      try {
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
      } catch (ogError) {
        console.error('Error using @vercel/og, falling back to SVG:', ogError);
      }
    }

    // Fallback: используем SVG
    const svgImage = await generateSvgImage(title, subtitle);
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(svgImage);

  } catch (error) {
    console.error('OG generation error:', error);
    
    // Простое SVG при любой ошибке
    const fallbackSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#667eea"/>
  <text x="600" y="315" font-size="80" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold">💕</text>
  <text x="600" y="400" font-size="48" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="Arial, sans-serif">Я тебя люблю</text>
</svg>`;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(fallbackSvg);
  }
}

export const config = {
  runtime: 'edge',
};
