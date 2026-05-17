// ═══════════════════════════════════════════════════════════
// КОНФИГУРАЦИЯ — измени здесь
// ═══════════════════════════════════════════════════════════
const CREATOR_NICK   = 'aldik';   // ← пароль (регистр неважен)
const REQUIRED_SCORE = 2;         // сколько правильных ответов нужно
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// IMAGE LOADING SYSTEM — гарантирует загрузку фотографий
// ═══════════════════════════════════════════════════════════
const IMAGE_LOADER = (() => {
  const isProduction = window.location.hostname && 
                      !window.location.hostname.includes('localhost') &&
                      !window.location.hostname.includes('127.0.0.1');
  
  const imageMap = {
    'public/utro.jpg': ['utro.jpg', 'public/utro.jpg', 'public/utro.png', 'utro.png'],
    'public/kofe.jpg': ['kofe.jpg', 'public/kofe.jpg', 'public/kofe.png', 'kofe.png'],
    'public/kino.jpg': ['kino.jpg', 'public/kino.jpg', 'public/kino.png', 'kino.png'],
    'public/luna.jpg': ['luna.jpg', 'public/luna.jpg', 'public/luna.png', 'luna.png'],
    'public/vmeste.jpg': ['vmeste.jpg', 'public/vmeste.jpg', 'public/vmeste.png', 'vmeste.png']
  };

  const loadAttempts = new Map();
  const maxRetries = 5;
  const loadedImages = new Set();

  const log = (msg, data = '') => {
    console.log(`[ImageLoader] ${msg}`, data);
  };

  const tryLoadImage = (img, srcVariants, retryCount = 0) => {
    if (!srcVariants || srcVariants.length === 0) {
      log(`❌ Нет вариантов пути для ${img.src}`);
      return false;
    }

    const variant = srcVariants[0];
    const remaining = srcVariants.slice(1);
    
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        log(`⏱ Таймаут загрузки ${variant}, пробуем следующий...`);
        if (remaining.length > 0) {
          resolve(tryLoadImage(img, remaining, retryCount));
        } else if (retryCount < maxRetries) {
          log(`🔄 Повтор попытки ${retryCount + 1}/${maxRetries} для ${img.getAttribute('data-original-src')}`);
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          setTimeout(() => {
            resolve(tryLoadImage(img, srcVariants, retryCount + 1));
          }, delay);
        } else {
          log(`❌ Все попытки исчерпаны для ${img.getAttribute('data-original-src')}`);
          resolve(false);
        }
      }, 8000);

      const onSuccess = () => {
        clearTimeout(timeoutId);
        loadedImages.add(img);
        log(`✅ Загружена фотография: ${variant}`);
        resolve(true);
      };

      const onError = () => {
        clearTimeout(timeoutId);
        log(`❌ Не найдена: ${variant}, пробуем следующий...`);
        if (remaining.length > 0) {
          resolve(tryLoadImage(img, remaining, retryCount));
        } else if (retryCount < maxRetries) {
          log(`🔄 Повтор попытки ${retryCount + 1}/${maxRetries}`);
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          setTimeout(() => {
            resolve(tryLoadImage(img, srcVariants, retryCount + 1));
          }, delay);
        } else {
          log(`❌ Все попытки исчерпаны для ${variant}`);
          resolve(false);
        }
      };

      img.onload = onSuccess;
      img.onerror = onError;
      img.src = variant;
      log(`🔍 Попытка загрузить: ${variant}`);
    });
  };

  const fixImagePaths = () => {
    const images = document.querySelectorAll('.gallery-photo');
    log(`Найдено ${images.length} изображений для загрузки`);
    
    images.forEach((img) => {
      const originalSrc = img.getAttribute('src');
      img.setAttribute('data-original-src', originalSrc);
      
      let variants = imageMap[originalSrc];
      if (!variants) {
        variants = [originalSrc];
      }

      // Переустраиваем порядок для production
      if (isProduction) {
        variants = variants.sort((a, b) => {
          // Приоритет: без 'public/' префикса сначала
          const aHasPrefix = a.startsWith('public/') ? 1 : 0;
          const bHasPrefix = b.startsWith('public/') ? 1 : 0;
          return aHasPrefix - bHasPrefix;
        });
      }

      log(`Варианты пути для ${originalSrc}:`, variants.join(', '));

      // Заменяем простой обработчик ошибок на умный loader
      img.removeEventListener('error', img.__oldErrorHandler);
      
      img.addEventListener('error', function() {
        const currentSrc = this.src;
        const isJpeg = currentSrc.endsWith('.jpg');
        
        if (isJpeg) {
          const pngVersion = currentSrc.replace('.jpg', '.png');
          log(`JPG не найден (${currentSrc}), пробуем PNG...`);
          this.src = pngVersion;
        } else {
          log(`Фото не найдена ${currentSrc}, показываем эмодзи`);
          this.style.display = 'none';
          const fallback = this.nextElementSibling;
          if (fallback) fallback.style.display = 'flex';
        }
      });

      // Начинаем загрузку
      tryLoadImage(img, variants).catch(() => {
        log(`⚠️ Ошибка при загрузке ${originalSrc}`);
      });
    });
  };

  const preloadImages = () => {
    log('🎯 Начинаем преполаганием изображений для production:', isProduction);
    const images = document.querySelectorAll('.gallery-photo');
    images.forEach(img => {
      const originalSrc = img.getAttribute('data-original-src') || img.getAttribute('src');
      const variants = imageMap[originalSrc] || [originalSrc];
      
      // Создаём скрытый Image объект для преполагания
      variants.forEach(variant => {
        const preloadImg = new Image();
        preloadImg.onload = () => log(`📦 Преполагание успешно: ${variant}`);
        preloadImg.onerror = () => log(`📦 Ошибка преполагания: ${variant}`);
        preloadImg.src = variant;
      });
    });
  };

  return {
    init: () => {
      log(`🚀 Инициализация loader (production: ${isProduction})`);
      fixImagePaths();
      preloadImages();
      
      // Переинициализируем при добавлении новых изображений
      const observer = new MutationObserver(fixImagePaths);
      observer.observe(document.body, { childList: true, subtree: true });
    },
    isProduction: () => isProduction,
    getImageVariants: (src) => imageMap[src] || [src],
    isLoaded: (img) => loadedImages.has(img)
  };
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

// ── HEART 3D ──
function generateHeart3D(name) {
  const letters = (name || 'X').split('');
  const pat = [
    '  XXXX    XXXX  ',
    ' XXXXXX  XXXXXX ',
    'XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX',
    ' XXXXXXXXXXXX  ',
    '  XXXXXXXXXX  ',
    '   XXXXXXXX   ',
    '    XXXXXX    ',
    '     XXXX     ',
    '      XX      '
  ];
  let out = '', idx = 0;
  for (const row of pat) {
    for (const ch of row) {
      out += ch === 'X' ? letters[idx++ % letters.length] : ' ';
    }
    out += '\n';
  }
  document.getElementById('heart-3d').textContent = out;
}

// ── NO BUTTON LOGIC (mobile-first shrink mechanic) ──
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
  document.getElementById('celebration-text').textContent = `Спасибо, ${state.userName || 'моя хорошая'}! ❤️`;
  document.getElementById('celebration-sub').textContent  = 'Ты сделала меня самым счастливым';
  celebrate();
  notifyYes();
  setTimeout(() => showScreen('screen-main'), 4500);
}

function celebrate() {
  const cel = document.getElementById('celebration');
  cel.classList.add('show');
  launchHearts();
  trackVisit();
  const t = setTimeout(() => cel.classList.remove('show'), 4500);
  cel.addEventListener('click', () => { clearTimeout(t); cel.classList.remove('show'); }, { once: true });
}

function closeCelebration() {
  document.getElementById('celebration').classList.remove('show');
}

function launchHearts() {
  const emojis = ['💕', '💖', '✨', '🌹', '💝', '🌸', '🎊'];
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.className = 'heart';
      h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      h.style.left = Math.random() * 100 + 'vw';
      h.style.top  = (window.innerHeight - 20) + 'px';
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 2100);
    }, i * 60);
  }
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