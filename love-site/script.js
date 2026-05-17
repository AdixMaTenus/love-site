// ═══════════════════════════════════════════════════════════
// КОНФИГУРАЦИЯ — измени здесь
// ═══════════════════════════════════════════════════════════
const CREATOR_NICK   = 'aldik';   // ← пароль (регистр неважен)
const REQUIRED_SCORE = 2;         // сколько правильных ответов нужно
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// IMAGE LOADING SYSTEM — надёжная загрузка фотографий
// ═══════════════════════════════════════════════════════════
const IMAGE_LOADER = (() => {
  const log = (msg) => console.log(`[ImageLoader] ${msg}`);

  // Определяем базовый URL папки с фотографиями.
  // При открытии через file:// — строим путь к папке public рядом с index.html.
  // При работе через HTTP сервер (vercel dev, vercel prod) — просто '/'.
  function getBaseUrl() {
    const loc = window.location;
    if (loc.protocol === 'file:') {
      // Берём путь к директории index.html и добавляем public/
      const dir = loc.href.substring(0, loc.href.lastIndexOf('/') + 1);
      return dir + 'public/';
    }
    // На Vercel файлы лежат в корне (vercel.json outputDirectory: "public")
    return '/';
  }

  // Имена файлов фотографий (без пути — путь добавим через baseUrl)
  const photoFiles = [
    'utro.jpg',
    'kofe.jpg',
    'kino.jpg',
    'luna.jpg',
    'vmeste.jpg',
  ];

  // Для каждого файла пробуем jpg, потом png
  function getVariants(filename) {
    const base = getBaseUrl();
    const name = filename.replace(/\.(jpg|png)$/, '');
    return [
      base + name + '.jpg',
      base + name + '.png',
    ];
  }

  // Загружаем одно изображение: перебираем варианты по очереди
  function loadOne(img, variants) {
    if (!variants.length) {
      log(`❌ Все варианты исчерпаны для ${img.dataset.name} — показываем эмодзи`);
      img.style.display = 'none';
      const fallback = img.nextElementSibling;
      if (fallback) fallback.style.display = 'flex';
      return;
    }

    const [current, ...rest] = variants;
    log(`🔍 Пробуем: ${current}`);

    img.onload = () => {
      img.onload = null;
      img.onerror = null;
      log(`✅ Загружено: ${current}`);
    };

    img.onerror = () => {
      img.onload = null;
      img.onerror = null;
      log(`❌ Не найдено: ${current}`);
      loadOne(img, rest);
    };

    img.src = current;
  }

  function init() {
    const base = getBaseUrl();
    log(`🚀 Старт. Базовый URL: ${base}`);

    const images = document.querySelectorAll('.gallery-photo');
    log(`Найдено изображений: ${images.length}`);

    images.forEach((img) => {
      // Вытаскиваем имя файла из атрибута src (например "public/utro.jpg" → "utro.jpg")
      const rawSrc = img.getAttribute('src') || '';
      const filename = rawSrc.split('/').pop(); // берём только имя файла
      img.dataset.name = filename;

      const variants = getVariants(filename);
      log(`Варианты для ${filename}: ${variants.join(', ')}`);
      loadOne(img, variants);
    });
  }

  return { init };
})();

// ── STATE ──
let state = {
  userName: localStorage.getItem('lsUserName') || '',
  currentSlide: 0,
  currentGallery: 0,
  readStart: null,
  timerInterval: null
};

// ═══════════════════════════════════════════════════════════
// QUIZ DATA — замени тексты на свои вопросы
// ═══════════════════════════════════════════════════════════
const quizQuestions = [
  {
    question: '❓Когда мы с тобой впервые списались?',
    options: ['8 марта, 10:05', '12 марта, 14:00', '15 марта, 18:30'],
    correctIndex: 1
  },
  {
    question: '❓Когда мы смотрели 9 серию отчаянных домохозяек?',
    options: ['7 мая, 00:50', '12 мая, 15:00', '20 мая, 19:45'],
    correctIndex: 0
  },
  {
    question: '❓Мой тебе самый первый комплимент был...',
    options: ['Волосы шикарные', 'Соскасын балапан', 'Богатый максимум болып турсын'],
    correctIndex: 2
  }
];
// ═══════════════════════════════════════════════════════════

document.getElementById('quiz-total').textContent    = quizQuestions.length;
document.getElementById('quiz-required').textContent = REQUIRED_SCORE;

// ── SCREEN MANAGEMENT ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  el.classList.add('active');
  window.scrollTo(0, 0);

  if (id === 'screen-main') startReadingTimer();
}

// ── NAME SCREEN ──
function startApp(name) {
  if (!name.trim()) {
    shakeInput('name-input');
    return;
  }
  state.userName = name.trim();
  localStorage.setItem('lsUserName', state.userName);
  generateHeart3D(state.userName);
  initQuiz();
  showScreen('screen-quiz');
}

// ── QUIZ ──
let quizAnswers = [];

function initQuiz() {
  quizAnswers = [];
  renderQuiz();
}

function renderQuiz() {
  const container = document.querySelector('.quiz-questions');
  container.innerHTML = '';

  quizQuestions.forEach((q, qi) => {
    const block = document.createElement('div');
    block.className = 'quiz-q-block';

    const qText = document.createElement('p');
    qText.className = 'quiz-q-text';
    qText.textContent = q.question;
    block.appendChild(qText);

    const optsDiv = document.createElement('div');
    optsDiv.className = 'quiz-options';
    optsDiv.id = 'opts-' + qi;
    block.appendChild(optsDiv);

    container.appendChild(block);

    q.options.forEach(function(opt, oi) {
      const label = document.createElement('label');
      label.className = 'quiz-option';

      const radio = document.createElement('input');
      radio.type  = 'radio';
      radio.name  = 'q' + qi;
      radio.value = String(oi);

      const span = document.createElement('span');
      span.textContent = opt;

      label.appendChild(radio);
      label.appendChild(span);

      radio.addEventListener('change', function() {
        optsDiv.querySelectorAll('.quiz-option').forEach(function(l) { l.classList.remove('selected'); });
        label.classList.add('selected');
        quizAnswers[qi] = oi;
        updateQuizUI();
      });

      optsDiv.appendChild(label);
    });
  });

  // Re-attach listener to submit button (fresh clone avoids stale references)
  const oldBtn = document.getElementById('btn-quiz-submit');
  const newBtn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  newBtn.style.display = 'none';
  newBtn.addEventListener('click', handleQuizSubmit);
}

function updateQuizUI() {
  let score = 0;
  quizQuestions.forEach(function(q, i) {
    if (quizAnswers[i] === q.correctIndex) score++;
  });
  document.getElementById('quiz-score').textContent = score;

  const answered = quizAnswers.filter(function(a) { return a !== undefined; }).length;
  const btn = document.getElementById('btn-quiz-submit');
  if (btn) btn.style.display = (answered === quizQuestions.length) ? 'block' : 'none';
}

function handleQuizSubmit() {
  let score = 0;
  quizQuestions.forEach((q, i) => { if (quizAnswers[i] === q.correctIndex) score++; });

  if (score >= REQUIRED_SCORE) {
    showScreen('screen-password');
  } else {
    const err = document.getElementById('quiz-error');
    err.textContent = `❌ Нужно ${REQUIRED_SCORE} правильных. У тебя ${score} из ${quizQuestions.length} — попробуй ещё!`;
    err.style.display = 'block';
    setTimeout(() => { err.style.display = 'none'; }, 3500);
  }
}

// ── PASSWORD ──
function verifyPassword() {
  var val = document.getElementById('password-input').value.trim();
  var err = document.getElementById('password-error');

  if (val.toLowerCase() === CREATOR_NICK.toLowerCase()) {
    document.getElementById('user-greeting').textContent = (state.userName || 'Привет') + ' ❤️';
    showScreen('screen-slideshow');
  } else {
    err.textContent = '❌ Неправильно — подумай ещё раз 😉';
    shakeInput('password-input');
    window.setTimeout(function() { err.textContent = ''; }, 3000);
  }
}

function shakeInput(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('shake');
  el.getBoundingClientRect(); // force reflow
  el.classList.add('shake');
  window.setTimeout(function() { el.classList.remove('shake'); }, 500);
}

// ── SLIDESHOW ──
function goToSlide(n) {
  state.currentSlide = Math.max(0, Math.min(quizQuestions.length, n));
  const slides = document.querySelectorAll('.slide');
  const dots   = document.querySelectorAll('.dot');
  const total  = slides.length;
  state.currentSlide = Math.max(0, Math.min(total - 1, n));
  slides.forEach((s, i) => s.classList.toggle('active', i === state.currentSlide));
  dots.forEach((d, i)   => d.classList.toggle('active', i === state.currentSlide));
}

function prevSlide() { goToSlide(state.currentSlide - 1); }

function nextSlide() {
  const total = document.querySelectorAll('.slide').length;
  if (state.currentSlide < total - 1) {
    goToSlide(state.currentSlide + 1);
  } else {
    showScreen('screen-main');
  }
}

// ── GALLERY ──
const galleryMeta = [
  'Утро у меня начинается всегда с тебя🌅',
  'В будущем хочу провести с тобой не один завтрак☕',
  'Наши вечера просмотра сериалов - лучшее расслабление🍿',
  'Провести целую ночь с тобой наедине - это цель а не мечта🌙',
  'Когда я с тобой — это отдых для моей души💖'
];

// ─ Инициализируем систему загрузки изображений ─
document.addEventListener('DOMContentLoaded', () => {
  IMAGE_LOADER.init();
});

// Если документ уже загружен
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    IMAGE_LOADER.init();
  });
} else {
  IMAGE_LOADER.init();
}

function selectGallerySlide(n) {
  state.currentGallery = n;
  document.querySelectorAll('.gallery-slide').forEach((s, i) => s.classList.toggle('active', i === n));
  document.querySelectorAll('.gallery-dot').forEach((d, i)   => d.classList.toggle('active', i === n));
  document.getElementById('gallery-text').textContent = galleryMeta[n];
}

// ── HEART 3D (legacy — kept for compatibility, не используется на экране вопроса) ──
function generateHeart3D(name) {
  // больше не рендерим ASCII на экране вопроса
}

// ══════════════════════════════════════════════════════
// YES SCREEN — полноэкранное 3D сердце + спецэффекты
// ══════════════════════════════════════════════════════

let yesAnimFrame = null;
let yesActive = false;

function showYesScreen(userName) {
  const screen = document.getElementById('screen-yes');
  screen.style.display = 'flex';
  screen.classList.add('active');

  // Обновляем текст
  const nameEl = document.getElementById('yes-name');
  nameEl.textContent = `Спасибо, ${userName || 'жаным'}! 💕`;

  // Запускаем анимацию текста через rAF (чтобы transition сработал)
  requestAnimationFrame(() => {
    setTimeout(() => {
      nameEl.style.opacity = '1';
      nameEl.style.transform = 'translateY(0)';
      document.getElementById('yes-sub').style.opacity = '1';
      document.getElementById('yes-sub').style.transform = 'translateY(0)';
      document.getElementById('yes-close-btn').style.opacity = '1';
    }, 50);
  });

  yesActive = true;
  initYesBg();
  initYesHeart(userName || 'X');
}

function closeYesScreen() {
  yesActive = false;
  if (yesAnimFrame) cancelAnimationFrame(yesAnimFrame);
  fwParticles.length = 0;  // очищаем частицы фейерверков

  const screen = document.getElementById('screen-yes');
  screen.style.opacity = '0';
  screen.style.transition = 'opacity 0.6s ease';
  setTimeout(() => {
    screen.style.display = 'none';
    screen.style.opacity = '';
    screen.style.transition = '';
    screen.classList.remove('active');

    // Сбрасываем текст для следующего показа
    document.getElementById('yes-name').style.opacity = '0';
    document.getElementById('yes-name').style.transform = 'translateY(30px)';
    document.getElementById('yes-sub').style.opacity = '0';
    document.getElementById('yes-sub').style.transform = 'translateY(20px)';
    document.getElementById('yes-close-btn').style.opacity = '0';

    showScreen('screen-main');
  }, 600);
}

// ══════════════════════════════════════════════════════
// YES SCREEN CANVAS — единый canvas, оптимизирован для телефона
// Слои: фон → фейерверки → 3D сердце → текст рисуется DOM поверх
// ══════════════════════════════════════════════════════

// ── ФЕЙЕРВЕРКИ ──
const fireworks = [];
const fwParticles = [];

function spawnFirework(W, H) {
  const x = W * (0.15 + Math.random() * 0.7);
  const y = H * (0.1  + Math.random() * 0.5);
  const hue = Math.random() * 360;
  const count = 28 + Math.floor(Math.random() * 16);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 1.5 + Math.random() * 2.5;
    fwParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.016 + Math.random() * 0.012,
      r: 1.5 + Math.random() * 1.5,
      hue: hue + Math.random() * 40 - 20,
    });
  }
}

function updateFireworks(W, H) {
  for (let i = fwParticles.length - 1; i >= 0; i--) {
    const p = fwParticles[i];
    p.x  += p.vx;
    p.y  += p.vy;
    p.vy += 0.06;   // гравитация
    p.vx *= 0.97;
    p.life -= p.decay;
    if (p.life <= 0) fwParticles.splice(i, 1);
  }
}

// ── ФОНОВЫЕ ЗВЁЗДЫ (статичный массив, не пересоздаём каждый кадр) ──
let bgStars = null;
function getBgStars() {
  if (bgStars) return bgStars;
  bgStars = Array.from({ length: 60 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.5 + 0.3,
    phase: Math.random() * Math.PI * 2,
    speed: 0.025 + Math.random() * 0.03,
    hue: Math.random() < 0.5 ? 330 + Math.random() * 30 : 270 + Math.random() * 40,
    alpha: 0.4 + Math.random() * 0.5,
  }));
  return bgStars;
}

// ── 3D СЕРДЦЕ — строим точки один раз ──
let heartPoints3D = null;
function getHeartPoints(name) {
  if (heartPoints3D && heartPoints3D._name === name) return heartPoints3D;

  const chars = (name.toUpperCase().repeat(4)).split('');
  const pts   = [];

  // Контур сердца (2D параметрика) × вращение вокруг вертикальной оси
  // → получаем тело вращения = 3D сердце
  // Используем меньше точек: 30×20 = 600 вместо 3600
  const tSteps   = 30;  // по контуру
  const phiSteps = 20;  // вокруг оси

  for (let i = 0; i < tSteps; i++) {
    const t    = (i / tSteps) * Math.PI * 2;
    const sinT = Math.sin(t);
    // Классическая параметрическая формула сердца
    const hx = 16 * sinT * sinT * sinT;
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    // Радиус сечения — чуть меньше у кончика, больше в середине
    const radius = Math.max(0.3, Math.abs(hx) * 0.12);

    for (let j = 0; j < phiSteps; j++) {
      const phi = (j / phiSteps) * Math.PI * 2;
      pts.push({
        ox:   hx + Math.cos(phi) * radius,
        oy:   hy,
        oz:   Math.sin(phi) * radius,
        char: chars[(i * phiSteps + j) % chars.length],
        baseHue: 320 + sinT * 30,
      });
    }
  }

  pts._name = name;
  heartPoints3D = pts;
  return pts;
}

// Проекция — вращение Y потом X, перспектива
function projectPt(ox, oy, oz, cosY, sinY, cosX, sinX) {
  const x1 =  ox * cosY + oz * sinY;
  const z1 = -ox * sinY + oz * cosY;
  const y2 =  oy * cosX - z1 * sinX;
  const z2 =  oy * sinX + z1 * cosX;
  const s  =  6 / (6 + z2 * 0.25 + 8);
  return { sx: x1 * s, sy: y2 * s, z2 };
}

// ── ГЛАВНЫЙ RENDER LOOP (один requestAnimationFrame на всё) ──
function initYesBg() { /* no-op — инициализация переехала в initYesHeart */ }

function initYesHeart(name) {
  const bgCanvas = document.getElementById('yes-bg-canvas');
  const htCanvas = document.getElementById('yes-heart-canvas');
  // Используем один контекст для фона+фейерверков, второй для сердца
  const bgCtx = bgCanvas.getContext('2d');
  const htCtx = htCanvas.getContext('2d');

  let W = 0, H = 0;

  function resize() {
    // Ограничиваем devicePixelRatio до 2 — на телефонах часто 3, это лишняя нагрузка
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = bgCanvas.offsetWidth;
    H = bgCanvas.offsetHeight;
    for (const c of [bgCanvas, htCanvas]) {
      c.width  = W * dpr;
      c.height = H * dpr;
      const ctx = c.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  resize();
  window.addEventListener('resize', resize);

  const stars    = getBgStars();
  const pts      = getHeartPoints(name);

  let startTs    = null;
  let fwTimer    = 0;       // когда запускать следующий фейерверк

  // Буфер для точек: избегаем аллокаций в цикле
  const projBuf  = new Array(pts.length);

  function frame(ts) {
    if (!yesActive) return;
    if (!startTs) startTs = ts;
    const elapsed = (ts - startTs) * 0.001;

    // ── ФОН ──
    bgCtx.fillStyle = 'rgba(10,0,8,0.92)';
    bgCtx.fillRect(0, 0, W, H);

    // Звёзды (мерцание через Math.sin, без создания новых объектов)
    for (const s of stars) {
      s.phase += s.speed * 0.016;
      const a = s.alpha * (0.45 + 0.55 * Math.sin(s.phase));
      bgCtx.fillStyle = `hsla(${s.hue},70%,88%,${a})`;
      bgCtx.fillRect(s.x * W - s.r, s.y * H - s.r, s.r * 2, s.r * 2);
    }

    // ── ФЕЙЕРВЕРКИ ──
    // Запускаем: 3 штуки подряд в первые 2 сек, потом каждые 2.5 сек
    if (elapsed < 2.5) {
      if (elapsed > fwTimer) { spawnFirework(W, H); fwTimer += 0.45; }
    } else {
      if (elapsed > fwTimer) { spawnFirework(W, H); fwTimer = elapsed + 2.2 + Math.random() * 0.8; }
    }
    updateFireworks(W, H);

    // Рисуем частицы фейерверков
    for (const p of fwParticles) {
      bgCtx.globalAlpha = p.life * 0.9;
      bgCtx.fillStyle   = `hsl(${p.hue},100%,70%)`;
      bgCtx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    }
    bgCtx.globalAlpha = 1;

    // ── 3D СЕРДЦЕ ──
    htCtx.clearRect(0, 0, W, H);

    // Появление: ease-out-cubic за 1.4 сек
    const appear = Math.min(1, elapsed / 1.4);
    const eased  = 1 - Math.pow(1 - appear, 3);
    if (eased < 0.01) { requestAnimationFrame(frame); return; }

    const rotY = elapsed * 0.65;
    const rotX = 0.28 + Math.sin(elapsed * 0.35) * 0.12;
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

    // Масштаб: занимаем ~55% минимальной стороны экрана — хорошо для телефона
    const heartScale = Math.min(W, H) * 0.027 * eased;
    const cx = W * 0.5;
    const cy = H * 0.42;  // чуть выше центра — снизу текст

    // Проецируем все точки
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const { sx, sy, z2 } = projectPt(p.ox, p.oy, p.oz, cosY, sinY, cosX, sinX);
      projBuf[i] = { sx, sy, z2, char: p.char, baseHue: p.baseHue };
    }

    // Сортировка по глубине — ближние рисуются последними (поверх)
    projBuf.sort((a, b) => a.z2 - b.z2);

    // Рисуем символы — без shadowBlur в цикле (дорого на мобиле)
    const hueShift = (rotY * 25) % 360;
    for (const p of projBuf) {
      const px = cx + p.sx * heartScale * 13;
      const py = cy + p.sy * heartScale * 13;
      if (px < -20 || px > W + 20 || py < -20 || py > H + 20) continue;

      // depth 0..1 (z2 диапазон примерно -4..4)
      const depth  = Math.max(0, Math.min(1, (p.z2 + 4) / 8));
      const bright = 45 + depth * 50;
      const alpha  = (0.25 + depth * 0.75) * eased;
      const size   = Math.max(5, heartScale * (0.45 + depth * 0.7));

      htCtx.font      = `bold ${size}px monospace`;
      htCtx.fillStyle = `hsla(${p.baseHue + hueShift},88%,${bright}%,${alpha})`;
      htCtx.fillText(p.char, px, py);
    }

    yesAnimFrame = requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

// ── QUESTION / CELEBRATE ──
const noMessages = [
  'Подожди...',
  'Ну ты чего?',
  'Прошу, подумай 🙏',
  'Может всё-таки да?',
  'Я не сдамся.',
  'Ещё разок?',
  'Пожалуйста... ❤️'
];

let noCount = 0;
const NO_MAX = 7; // после 7 нажатий кнопка исчезает

function handleNoPress() {
  noCount++;
  const btn    = document.getElementById('btn-no-shrink');
  const msgEl  = document.getElementById('no-drama-msg');

  const scale = Math.max(0.35, 1 - noCount * 0.09);
  const alpha = Math.max(0.25, 1 - noCount * 0.10);
  btn.style.transform   = `scale(${scale})`;
  btn.style.opacity     = alpha;
  btn.style.fontSize    = `${Math.max(10, 15 - noCount)}px`;
  btn.style.padding     = `${Math.max(4, 10 - noCount)}px ${Math.max(8, 28 - noCount * 3)}px`;

  const msg = noMessages[Math.min(noCount - 1, noMessages.length - 1)];
  msgEl.textContent = msg;
  msgEl.classList.add('show');
  setTimeout(() => msgEl.classList.remove('show'), 1800);

  if (noCount >= NO_MAX) {
    btn.style.transition    = 'all 0.5s ease';
    btn.style.transform     = 'scale(0)';
    btn.style.opacity       = '0';
    btn.style.pointerEvents = 'none';

    setTimeout(() => {
      msgEl.textContent        = 'Похоже, тебе придется согласиться';
      msgEl.style.bottom       = '0';
      msgEl.style.position     = 'relative';
      msgEl.style.transform    = 'none';
      msgEl.style.left         = 'auto';
      msgEl.style.display      = 'block';
      msgEl.style.opacity      = '1';
      msgEl.style.fontSize     = '14px';
      msgEl.style.padding      = '8px 0';
      msgEl.style.color        = '#888';
    }, 600);
  }

  if (navigator.vibrate) navigator.vibrate(40);
}

// ── QUESTION / CELEBRATE ──
function goToQuestion() {
  noCount = 0;
  const btn = document.getElementById('btn-no-shrink');
  btn.style.transform     = '';
  btn.style.opacity       = '';
  btn.style.fontSize      = '';
  btn.style.padding       = '';
  btn.style.pointerEvents = '';
  const msgEl = document.getElementById('no-drama-msg');
  msgEl.textContent = '';
  msgEl.style = '';
  showScreen('screen-question');
}

function celebrateQuestion() {
  if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
  notifyYes();
  trackVisit();
  showYesScreen(state.userName);
}

function closeCelebration() {
  closeYesScreen();
}

function launchHearts() {
  // теперь эффект реализован внутри yes-экрана
}

// ── READING TIMER ──
function startReadingTimer() {
  if (state.readStart) return; // уже запущен
  state.readStart = Date.now();
  state.timerInterval = setInterval(() => {
    const sec  = Math.floor((Date.now() - state.readStart) / 1000);
    const m    = Math.floor(sec / 60);
    const s    = sec % 60;
    const disp = document.getElementById('timer-display');
    if (disp) disp.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  }, 1000);
}

// ── READ PROGRESS BAR ──
function updateProgressBar() {
  const mainEl = document.getElementById('screen-main');
  if (!mainEl.classList.contains('active')) return;
  const scrollTop    = mainEl.scrollTop;
  const scrollHeight = mainEl.scrollHeight - mainEl.clientHeight;
  const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  document.getElementById('read-progress-bar').style.width = pct + '%';
}

// ── SCROLL TO SECTION ──
function scrollToSection(tag) {
  const mainEl = document.getElementById('screen-main');
  if (!mainEl.classList.contains('active')) {
    showScreen('screen-main');
    window.setTimeout(function() {
      var el = document.querySelector('[data-section="' + tag + '"]');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  } else {
    var el = document.querySelector('[data-section="' + tag + '"]');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

function scrollToTop() { document.getElementById('screen-main').scrollTop = 0; }

// ── API CALLS ──
async function trackVisit() {
  try {
    const r = await fetch('/api/visit');
    if (!r.ok) return null;
    return await r.json().catch(() => null);
  } catch { return null; }
}

async function notifyYes() {
  try {
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `💕 ${state.userName || 'Она'} нажала ДА! 🎉` })
    }).catch(() => {});
  } catch {}
}

// ── SWIPE HANDLER ──
class Swipe {
  constructor(selector, onLeft, onRight) {
    const el = document.querySelector(selector);
    if (!el) return;
    let sx = 0, sy = 0;
    el.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) dx > 0 ? onLeft() : onRight();
    });
  }
}

// ═══════════════════════════════════════════════════════════
// INIT — навешиваем события после загрузки DOM
// ═══════════════════════════════════════════════════════════
document.getElementById('btn-continue').addEventListener('click', () => startApp(document.getElementById('name-input').value));
document.getElementById('name-input').addEventListener('keypress', e => { if (e.key === 'Enter') startApp(e.target.value); });

document.getElementById('btn-verify').addEventListener('click', verifyPassword);
document.getElementById('password-input').addEventListener('keypress', e => { if (e.key === 'Enter') verifyPassword(); });

document.getElementById('btn-prev-slide').addEventListener('click', prevSlide);
document.getElementById('btn-next-slide').addEventListener('click', nextSlide);

// Dots: slideshow
document.querySelectorAll('.dot').forEach((d, i) => {
  d.setAttribute('tabindex', '0');
  d.addEventListener('click', () => goToSlide(i));
  d.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') goToSlide(i); });
});

// Dots: gallery
document.querySelectorAll('.gallery-dot').forEach((d, i) => {
  d.setAttribute('tabindex', '0');
  d.addEventListener('click', () => selectGallerySlide(i));
  d.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') selectGallerySlide(i); });
});

// Reason cards expand
document.querySelectorAll('.reason-card').forEach(card => {
  card.addEventListener('click', function () {
    document.querySelectorAll('.reason-card').forEach(c => { if (c !== this) c.classList.remove('expanded'); });
    this.classList.toggle('expanded');
  });
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') card.click(); });
});

// Read progress bar
document.getElementById('screen-main').addEventListener('scroll', updateProgressBar);

// Keyboard nav
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  prevSlide();
  if (e.key === 'ArrowRight') nextSlide();
});

// Swipes
new Swipe('#gallery-container', () => selectGallerySlide((state.currentGallery - 1 + 5) % 5), () => selectGallerySlide((state.currentGallery + 1) % 5));
new Swipe('.slideshow-container', prevSlide, nextSlide);

// Restore name if returning
window.addEventListener('load', () => {
  if (state.userName) {
    document.getElementById('user-greeting').textContent = `${state.userName} ❤️`;
    generateHeart3D(state.userName);
  }
});