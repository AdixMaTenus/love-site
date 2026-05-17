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
    question: '❓ Вопрос-заглушка 1: выбери правильный вариант',
    options: ['Вариант A', 'Вариант B (правильный)', 'Вариант C'],
    correctIndex: 1
  },
  {
    question: '❓ Вопрос-заглушка 2: что из этого верно?',
    options: ['Ответ 1 (правильный)', 'Ответ 2', 'Ответ 3'],
    correctIndex: 0
  },
  {
    question: '❓ Вопрос-заглушка 3: выбери верное',
    options: ['Вариант X', 'Вариант Y', 'Вариант Z (правильный)'],
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
  'Наше утро вместе — волшебство ☕',
  'С тобой даже кофе вкуснее ☕',
  'Наши вечера в кино — как сон 🎬',
  'Луна светит только для нас 🌙',
  'Когда я с тобой — это рай 💑'
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
  nameEl.textContent = `Спасибо, ${userName || 'моя хорошая'}! 💕`;

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

// ── ФОНОВЫЕ ЧАСТИЦЫ ──
function initYesBg() {
  const canvas = document.getElementById('yes-bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Создаём частицы: мерцающие звёзды + дрейфующие пятна
  particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * 1,
    y: Math.random() * 1,
    r: Math.random() * 2.5 + 0.3,
    speed: Math.random() * 0.0003 + 0.00005,
    angle: Math.random() * Math.PI * 2,
    twinkle: Math.random() * Math.PI * 2,
    twinkleSpeed: Math.random() * 0.04 + 0.01,
    hue: Math.random() < 0.5 ? 330 + Math.random() * 30 : 280 + Math.random() * 40,
    alpha: Math.random() * 0.7 + 0.2,
  }));

  // Большие световые пятна
  const glows = Array.from({ length: 5 }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.15 + Math.random() * 0.2,
    hue: i % 2 === 0 ? 330 : 290,
    phase: Math.random() * Math.PI * 2,
    speed: 0.003 + Math.random() * 0.004,
  }));

  function drawBg(t) {
    if (!yesActive) return;

    // Глубокий тёмный фон с лёгким свечением
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0a0008';
    ctx.fillRect(0, 0, W, H);

    // Рисуем световые пятна
    for (const g of glows) {
      g.phase += g.speed;
      const cx = (0.2 + Math.sin(g.phase * 0.7) * 0.35) * W;
      const cy = (0.2 + Math.cos(g.phase * 0.5) * 0.35) * H;
      const pulse = 0.7 + 0.3 * Math.sin(g.phase * 1.3);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, g.r * Math.min(W, H) * pulse);
      grad.addColorStop(0, `hsla(${g.hue},90%,60%,0.12)`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // Рисуем звёзды
    for (const p of particles) {
      p.angle += p.speed;
      p.twinkle += p.twinkleSpeed;
      const px = ((p.x + Math.cos(p.angle) * 0.15) % 1 + 1) % 1 * W;
      const py = ((p.y + Math.sin(p.angle * 0.7) * 0.1) % 1 + 1) % 1 * H;
      const alpha = p.alpha * (0.5 + 0.5 * Math.sin(p.twinkle));
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},80%,85%,${alpha})`;
      ctx.fill();
    }

    yesAnimFrame = requestAnimationFrame(drawBg);
  }

  drawBg(0);
}

// ── 3D ВРАЩАЮЩЕЕСЯ СЕРДЦЕ ──
function initYesHeart(name) {
  const canvas = document.getElementById('yes-heart-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Строим 3D точки сердца параметрически
  const chars = (name.toUpperCase() + name.toUpperCase()).split('');
  const points3D = [];

  // Параметрическое сердце в 3D: классическая формула
  const steps = 60;
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    for (let j = 0; j < steps; j++) {
      const phi = (j / steps) * Math.PI * 2;

      // Поверхность сердца (3D параметрическая)
      const sinT = Math.sin(t);
      const x3 = 16 * sinT * sinT * sinT;
      const y3 = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));

      // Небольшое "выдавливание" вглубь
      const depth = Math.cos(phi) * 1.5;
      const sideX  = Math.sin(phi) * 1.5;

      // Добавляем нормаль для 3D эффекта
      const nx = Math.cos(t) * sinT;

      points3D.push({
        ox: x3 + sideX * Math.abs(nx + 0.5),
        oy: y3,
        oz: depth * (1 - Math.abs(sinT) * 0.5),
        char: chars[(i * steps + j) % chars.length],
        hue: 320 + Math.sin(t + phi) * 40,
      });
    }
  }

  let rotX = 0.3;
  let rotY = 0;
  let autoRotY = 0;
  let autoRotX = 0.3;
  let scale = 0;      // анимация появления

  function project(ox, oy, oz, rX, rY) {
    // Вращение по Y
    const x1 =  ox * Math.cos(rY) + oz * Math.sin(rY);
    const z1 = -ox * Math.sin(rY) + oz * Math.cos(rY);
    // Вращение по X
    const y2 =  oy * Math.cos(rX) - z1 * Math.sin(rX);
    const z2 =  oy * Math.sin(rX) + z1 * Math.cos(rX);
    // Перспектива
    const fov = 5;
    const zOff = 10;
    const s = fov / (fov + z2 * 0.3 + zOff);
    return { sx: x1 * s, sy: y2 * s, z2, s };
  }

  let startTime = null;

  function drawHeart(ts) {
    if (!yesActive) return;
    if (!startTime) startTime = ts;
    const elapsed = (ts - startTime) / 1000;

    // Появление сердца
    scale = Math.min(1, elapsed / 1.2);
    const eased = scale < 1 ? 1 - Math.pow(1 - scale, 3) : 1;

    autoRotY = elapsed * 0.6;
    autoRotX = 0.3 + Math.sin(elapsed * 0.4) * 0.15;

    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2 - H * 0.08; // чуть выше центра, освобождаем место тексту
    const baseSize = Math.min(W, H) * 0.022 * eased;

    // Проецируем и сортируем по глубине (художник: ближние поверх)
    const projected = points3D.map(p => {
      const { sx, sy, z2, s } = project(p.ox, p.oy, p.oz, autoRotX, autoRotY);
      return { ...p, sx, sy, z2, s };
    });

    projected.sort((a, b) => a.z2 - b.z2);

    for (const p of projected) {
      const px = cx + p.sx * baseSize * 12;
      const py = cy + p.sy * baseSize * 12;

      // Обрезаем то что за экраном
      if (px < -50 || px > W + 50 || py < -50 || py > H + 50) continue;

      // Яркость зависит от глубины (дальние — темнее)
      const depthFactor = (p.z2 + 12) / 24; // 0..1
      const bright = 40 + depthFactor * 55;
      const alpha  = 0.3 + depthFactor * 0.7;

      // Размер символа зависит от глубины
      const fontSize = Math.max(6, baseSize * (0.5 + depthFactor * 0.8));

      ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
      ctx.fillStyle = `hsla(${p.hue + autoRotY * 20},90%,${bright}%,${alpha * eased})`;

      // Свечение для ближних точек
      if (depthFactor > 0.75) {
        ctx.shadowColor = `hsla(${p.hue},100%,70%,0.8)`;
        ctx.shadowBlur  = fontSize * 2;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fillText(p.char, px, py);
    }

    ctx.shadowBlur = 0;
    requestAnimationFrame(drawHeart);
  }

  requestAnimationFrame(drawHeart);
}

// ── QUESTION / CELEBRATE ──
const noMessages = [
  'Подожди... 😔',
  'Это больно...',
  'Прошу, подумай 🙏',
  'Может всё-таки да? 🥺',
  'Я не сдамся... 💪',
  'Ещё разок? 😭',
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
      msgEl.textContent        = '😭 Кнопка сломалась от грусти...';
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
