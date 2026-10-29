'use strict';
/* ====== CẤU HÌNH ====== */
const START = new Date(2026, 4, 23, 0, 0, 0);   // 23/05/2026 – ngày yêu nhau
const PASSWORD = '2305';
const HER_BDAY = { d: 24, m: 8 };               // 24/8
const KEY = 'tam_love_v2';

/* ====== TIỆN ÍCH ====== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const shuffle = a => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.random() * (i + 1) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

let S = { ok: false, done: {}, gifts: [], moments: [] };
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const daysSince = () => Math.floor((Date.now() - START) / 864e5);

/* ====== ÂM THANH + NHẠC NỀN ====== */
let AC = null, soundOn = true, musicOn = true;
let musicNodes = null;

function ensureAC() {
  if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
  if (AC.state === 'suspended') AC.resume();
  return AC;
}

function tone(f, d = 0.15, t = 'sine', v = 0.08, delay = 0) {
  if (!soundOn) return;
  try {
    const ctx = ensureAC();
    const o = ctx.createOscillator(), g = ctx.createGain();
    const t0 = ctx.currentTime + delay;
    o.type = t;
    o.frequency.value = f;
    g.gain.setValueAtTime(v, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + d);
  } catch (e) {}
}

const sfx = {
  pop: () => tone(880, 0.1, 'sine'),
  good: () => { tone(660, 0.1); tone(990, 0.15, 'sine', 0.08, 0.08); },
  bad: () => tone(160, 0.3, 'sawtooth', 0.05),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'triangle', 0.09, i * 0.13)),
  flip: () => tone(520, 0.08, 'triangle', 0.07),
  open: () => { tone(440, 0.12, 'sine', 0.07); tone(660, 0.18, 'sine', 0.06, 0.1); }
};

/* Soft romantic piano-like ambient loop (no lyrics) */
function startMusic() {
  if (!musicOn || musicNodes) return;
  try {
    const ctx = ensureAC();
    const master = ctx.createGain();
    master.gain.value = 0.065;
    master.connect(ctx.destination);

    // Soft pad
    const pad = ctx.createOscillator();
    const padG = ctx.createGain();
    pad.type = 'sine';
    pad.frequency.value = 196; // G3
    padG.gain.value = 0.35;
    pad.connect(padG);
    padG.connect(master);
    pad.start();

    // Gentle arpeggio notes (C major-ish romantic)
    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63]; // C E G C G E
    const noteOscs = [];
    let step = 0;

    function playStep() {
      if (!musicNodes) return;
      const f = notes[step % notes.length];
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      const t0 = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.22, t0 + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
      o.connect(g);
      g.connect(master);
      o.start(t0);
      o.stop(t0 + 1.5);
      noteOscs.push(o);
      step++;
    }

    playStep();
    const interval = setInterval(playStep, 1600);

    // Very soft high sparkle
    const sparkle = setInterval(() => {
      if (!musicNodes || !musicOn) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 1046 + Math.random() * 400;
      const t0 = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.04, t0 + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.8);
      o.connect(g);
      g.connect(master);
      o.start(t0);
      o.stop(t0 + 0.9);
    }, 3200);

    musicNodes = { master, pad, interval, sparkle, noteOscs };
  } catch (e) {}
}

function stopMusic() {
  if (!musicNodes) return;
  try {
    clearInterval(musicNodes.interval);
    clearInterval(musicNodes.sparkle);
    musicNodes.pad.stop();
    musicNodes.master.disconnect();
  } catch (e) {}
  musicNodes = null;
}

$('#sndBtn').onclick = () => {
  soundOn = !soundOn;
  musicOn = soundOn;
  $('#sndBtn').textContent = soundOn ? '🔊' : '🔇';
  if (soundOn) {
    ensureAC();
    if (S.ok) startMusic();
  } else {
    stopMusic();
  }
};

/* ====== NỀN CÁNH HOA + PHÁO TIM ====== */
const bg = $('#bg'), bx = bg.getContext('2d');
let W, H, petals = [], bursts = [];

function resizeBg() {
  W = bg.width = innerWidth;
  H = bg.height = innerHeight;
}
addEventListener('resize', resizeBg);
resizeBg();

const EMO = ['🌸', '💗', '🤍', '✨', '🌷', '💕'];
for (let i = 0; i < 26; i++) petals.push(newPetal(true));

function newPetal(init) {
  return {
    x: Math.random() * W,
    y: init ? Math.random() * H : -40,
    s: 13 + Math.random() * 15,
    v: 0.35 + Math.random() * 0.85,
    w: Math.random() * 6,
    e: EMO[Math.random() * EMO.length | 0]
  };
}

function burst(x = W / 2, y = H / 2, n = 45) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, s = 2.2 + Math.random() * 6.5;
    bursts.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 2.2,
      l: 1,
      e: ['💖', '💗', '💕', '🌸', '✨', '❤️', '💘'][Math.random() * 7 | 0],
      s: 15 + Math.random() * 18
    });
  }
}

function loopBg() {
  bx.clearRect(0, 0, W, H);
  bx.globalAlpha = 0.58;
  petals.forEach((p, i) => {
    p.y += p.v;
    p.w += 0.018;
    p.x += Math.sin(p.w) * 0.55;
    if (p.y > H + 40) petals[i] = newPetal();
    bx.font = p.s + 'px serif';
    bx.fillText(p.e, p.x, p.y);
  });
  bx.globalAlpha = 1;
  bursts = bursts.filter(b => b.l > 0);
  bursts.forEach(b => {
    b.x += b.vx;
    b.y += b.vy;
    b.vy += 0.11;
    b.l -= 0.011;
    bx.globalAlpha = Math.max(b.l, 0);
    bx.font = b.s + 'px serif';
    bx.fillText(b.e, b.x, b.y);
  });
  bx.globalAlpha = 1;
  requestAnimationFrame(loopBg);
}
loopBg();

document.addEventListener('pointerdown', e => {
  if (!e.target.closest('#cv') && !e.target.closest('.mcard') && !e.target.closest('.gbox')) {
    burst(e.clientX, e.clientY, 7);
  }
});

/* ====== ĐIỀU HƯỚNG ====== */
function show(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  $('#' + id).classList.add('active');
  scrollTo(0, 0);
  if (id === 'home') refreshHome();
}

$$('[data-back]').forEach(b => b.onclick = () => {
  stopCatch();
  show('home');
});

$$('[data-go]').forEach(b => b.onclick = () => {
  const g = b.dataset.go;
  if (g === 'letter' && b.classList.contains('locked')) {
    modal('<h2 class="script">Chưa mở được đâu vợ ơi 🔒</h2><p>Vợ hãy hoàn thành <b>Hứng tim</b>, <b>Khoảnh khắc yêu</b> và <b>Vợ chồng thân thiết</b> trước nhé. Lá thư này chồng giữ cho phần cuối cùng!</p>', [['Dạ ♥']]);
    return;
  }
  show(g);
  ({
    catch: initCatch,
    moments: initMoments,
    quiz: initQuiz,
    gift: initGift,
    letter: initLetter
  })[g]();
});

function modal(html, btns = [['Tiếp tục']]) {
  const m = $('#modal'), box = $('#modalBox');
  box.innerHTML = html + '<div style="margin-top:14px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap"></div>';
  btns.forEach(([t, fn, ghost]) => {
    const b = document.createElement('button');
    b.className = 'btn' + (ghost ? ' ghost' : '');
    b.textContent = t;
    b.onclick = () => { m.classList.add('hidden'); fn && fn(); };
    box.lastChild.appendChild(b);
  });
  m.classList.remove('hidden');
}

/* ====== CỔNG ====== */
function tryPw() {
  const v = $('#pw').value.trim();
  if (v === PASSWORD) {
    S.ok = true;
    save();
    sfx.win();
    burst();
    ensureAC();
    startMusic();
    setTimeout(() => show('home'), 550);
  } else {
    $('#pw').classList.remove('shake');
    void $('#pw').offsetWidth;
    $('#pw').classList.add('shake');
    sfx.bad();
    $('#pwMsg').textContent = 'Sai rồi, vợ nhớ lại ngày đặc biệt nhất của mình nhé 🥺 (Gợi ý: ngày 23 tháng 5)';
  }
}
$('#pwBtn').onclick = tryPw;
$('#pw').addEventListener('keydown', e => e.key === 'Enter' && tryPw());

/* ====== TRANG CHỦ ====== */
function pad(n) { return String(n).padStart(2, '0'); }

function tickCounter() {
  const ms = Date.now() - START;
  const d = Math.floor(ms / 864e5);
  const h = Math.floor(ms / 36e5) % 24;
  const m = Math.floor(ms / 6e4) % 60;
  const s = Math.floor(ms / 1e3) % 60;
  $('#counter').innerHTML = [[d, 'ngày'], [pad(h), 'giờ'], [pad(m), 'phút'], [pad(s), 'giây']]
    .map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');
}

function nextEventText() {
  const now = new Date(), t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let ms = new Date(now.getFullYear(), now.getMonth(), 23);
  if (ms < t0) ms = new Date(now.getFullYear(), now.getMonth() + 1, 23);
  const months = (ms.getFullYear() - 2026) * 12 + ms.getMonth() - 4;
  const dm = Math.round((ms - t0) / 864e5);
  let bd = new Date(now.getFullYear(), HER_BDAY.m - 1, HER_BDAY.d);
  if (bd < t0) bd = new Date(now.getFullYear() + 1, HER_BDAY.m - 1, HER_BDAY.d);
  const db = Math.round((bd - t0) / 864e5);
  const a = dm === 0
    ? `🎉 Hôm nay kỷ niệm ${months} tháng yêu nhau!`
    : `⏳ Còn ${dm} ngày nữa là tròn ${months} tháng yêu nhau`;
  const b = db === 0
    ? '🎂 HÔM NAY LÀ SINH NHẬT VỢ YÊU!!!'
    : `🎂 Còn ${db} ngày nữa là sinh nhật vợ`;
  return a + '<br>' + b;
}

function refreshHome() {
  $('#nextEvent').innerHTML = nextEventText();
  const d = S.done;
  const three = d.catch && d.moments && d.quiz;
  $$('.tile[data-go]').forEach(t => t.classList.toggle('done', !!d[t.dataset.go]));
  const lt = $('#letterTile');
  lt.classList.toggle('locked', !three);
  lt.classList.toggle('ready', !!three && !d.letter);
  $('#letterSmall').textContent = three
    ? 'Đã mở khóa – chạm để đọc 💕'
    : 'Hoàn thành 3 trò đầu để mở khóa';
  const n = ['catch', 'moments', 'quiz', 'gift', 'letter'].filter(k => d[k]).length;
  $('#progBar').style.width = (n / 5 * 100) + '%';
  $('#progTxt').textContent = `Đã hoàn thành ${n}/5 món quà`;
}

setInterval(tickCounter, 1000);
tickCounter();
if (S.ok) {
  show('home');
  // Try start music if already unlocked (may need user gesture on some browsers)
  setTimeout(() => { if (musicOn) startMusic(); }, 300);
}

/* ====== TRÒ 1: HỨNG TIM ====== */
const cv = $('#cv'), cx = cv.getContext('2d');
cv.width = 360;
cv.height = 520;
let cg = null;

const MSGS = {
  8: 'Chồng yêu vợ nhiều lắm! 💗',
  16: 'Vợ hứng giỏi quá đi!',
  24: 'Sắp được rồi vợ ơi! 🥰'
};

function initCatch() {
  $('#catchOverlay').classList.remove('hidden');
  stopCatch();
  drawIdle();
  updLives(3);
  $('#catchScore').textContent = '0/30';
}

function drawIdle() {
  cx.clearRect(0, 0, 360, 520);
  cx.font = '56px serif';
  cx.textAlign = 'center';
  cx.fillText('🧺', 180, 490);
}

$('#catchStart').onclick = () => {
  $('#catchOverlay').classList.add('hidden');
  cg = {
    x: 180, score: 0, lives: 3, items: [], t: 0,
    last: performance.now(), run: true, msg: '', msgT: 0, keys: {}, spawn: 0
  };
  requestAnimationFrame(stepCatch);
};

function stopCatch() { if (cg) cg.run = false; }

function updLives(n) {
  $('#lives').textContent = '❤️'.repeat(Math.max(n, 0)) + '🤍'.repeat(Math.max(3 - n, 0));
}

function setX(clientX) {
  const r = cv.getBoundingClientRect();
  if (cg) cg.x = Math.min(330, Math.max(30, (clientX - r.left) / r.width * 360));
}

cv.addEventListener('pointermove', e => setX(e.clientX));
cv.addEventListener('pointerdown', e => {
  cv.setPointerCapture(e.pointerId);
  setX(e.clientX);
});
addEventListener('keydown', e => { if (cg) cg.keys[e.key] = true; });
addEventListener('keyup', e => { if (cg) cg.keys[e.key] = false; });

function stepCatch(now) {
  if (!cg || !cg.run) return;
  const dt = Math.min((now - cg.last) / 16.67, 3);
  cg.last = now;
  cg.t += dt;

  if (cg.keys.ArrowLeft) cg.x = Math.max(30, cg.x - 7.5 * dt);
  if (cg.keys.ArrowRight) cg.x = Math.min(330, cg.x + 7.5 * dt);

  cg.spawn -= dt;
  if (cg.spawn <= 0) {
    const r = Math.random();
    cg.items.push({
      x: 25 + Math.random() * 310,
      y: -20,
      v: (2.3 + cg.score * 0.065) * (0.9 + Math.random() * 0.4),
      t: r < 0.14 ? 'big' : r < 0.3 ? 'bad' : 'heart'
    });
    cg.spawn = Math.max(20, 46 - cg.score * 0.7);
  }

  cx.clearRect(0, 0, 360, 520);
  cx.textAlign = 'center';

  cg.items.forEach(it => {
    it.y += it.v * dt;
    cx.font = (it.t === 'big' ? 40 : 32) + 'px serif';
    cx.fillText(it.t === 'big' ? '💖' : it.t === 'bad' ? '💔' : '💗', it.x, it.y);
  });

  const hit = it => it.y > 455 && it.y < 505 && Math.abs(it.x - cg.x) < 44;
  cg.items = cg.items.filter(it => {
    if (hit(it)) {
      if (it.t === 'bad') {
        cg.lives--;
        updLives(cg.lives);
        sfx.bad();
        navigator.vibrate && navigator.vibrate(80);
      } else {
        const old = cg.score;
        cg.score += it.t === 'big' ? 3 : 1;
        sfx.pop();
        $('#catchScore').textContent = Math.min(cg.score, 30) + '/30';
        for (const k in MSGS) {
          if (old < k && cg.score >= k) {
            cg.msg = MSGS[k];
            cg.msgT = 130;
          }
        }
      }
      return false;
    }
    return it.y < 540;
  });

  cx.font = '58px serif';
  cx.fillText('🧺', cg.x, 495);

  if (cg.msgT > 0) {
    cg.msgT -= dt;
    cx.font = '700 22px Quicksand, sans-serif';
    cx.fillStyle = '#c2185b';
    cx.fillText(cg.msg, 180, 120);
    cx.fillStyle = '#000';
  }

  if (cg.score >= 30) {
    cg.run = false;
    catchEnd(true);
    return;
  }
  if (cg.lives <= 0) {
    cg.run = false;
    catchEnd(false);
    return;
  }
  requestAnimationFrame(stepCatch);
}

function catchEnd(win) {
  if (win) {
    sfx.win();
    burst(innerWidth / 2, innerHeight / 2, 90);
    S.done.catch = true;
    save();
    modal(
      '<div style="font-size:56px">🏆</div><h2 class="script">Vợ giỏi quá!</h2><p>Vợ đã hứng trọn 30 trái tim của chồng rồi. Mà thật ra tim chồng thì vợ giữ hết từ lâu rồi ấy ♥</p>',
      [['Về trang chủ', () => show('home')], ['Chơi lại', () => initCatch(), true]]
    );
  } else {
    modal(
      '<h2 class="script">Ôi, hết mạng rồi 🥺</h2><p>Không sao đâu vợ, chồng cho vợ chơi lại nè!</p>',
      [['Chơi lại', () => initCatch()]]
    );
  }
}

/* ====== TRÒ 2 MỚI: KHOẢNH KHẮC YÊU ====== */
const MOMENTS = [
  { id: 1, msg: 'Ngày đầu tiên mình chính thức yêu nhau… Chồng vẫn nhớ rõ cảm giác ấy.' },
  { id: 2, msg: 'Nụ cười của vợ làm cả thế giới của chồng sáng lên.' },
  { id: 3, msg: 'Những buổi hẹn hò đơn giản nhưng đầy ắp hạnh phúc.' },
  { id: 4, msg: 'Chồng thích nhất là được ngồi cạnh vợ, chẳng cần nói gì nhiều.' },
  { id: 5, msg: 'Mỗi tấm ảnh đều là một khoảnh khắc chồng muốn giữ mãi.' },
  { id: 6, msg: 'Cảm ơn vợ đã luôn ở bên, dù chồng còn nhiều khuyết điểm.' },
  { id: 7, msg: 'Vợ là lý do khiến chồng muốn trở thành phiên bản tốt hơn mỗi ngày.' },
  { id: 8, msg: 'Mãi mãi là của nhau nhé – Nguyễn Tiến Vũ & Phan Thị Thanh Tâm ♥' }
];

function initMoments() {
  const g = $('#momGrid');
  g.innerHTML = '';
  const opened = S.moments || [];
  MOMENTS.forEach(m => {
    const isOpen = opened.includes(m.id);
    const c = document.createElement('button');
    c.className = 'mcard' + (isOpen ? ' open' : '');
    c.dataset.id = m.id;
    c.innerHTML = `
      <div class="in">
        <div class="f">
          <span>💌</span>
          <small>Chạm để mở</small>
        </div>
        <div class="b" style="background-image:url(images/c${m.id}.jpg)" data-msg="${m.msg}"></div>
      </div>`;
    c.onclick = () => openMoment(c, m);
    g.appendChild(c);
  });
  updMomCount();
}

function updMomCount() {
  const n = (S.moments || []).length;
  $('#momCount').textContent = n + '/8';
}

function openMoment(c, m) {
  if (c.classList.contains('open')) return;
  c.classList.add('flip', 'open');
  sfx.open();
  if (!S.moments) S.moments = [];
  if (!S.moments.includes(m.id)) {
    S.moments.push(m.id);
    save();
  }
  updMomCount();

  // Small delayed check for completion
  setTimeout(() => {
    if (S.moments.length >= 8 && !S.done.moments) {
      S.done.moments = true;
      save();
      sfx.win();
      burst(innerWidth / 2, innerHeight / 2, 80);
      modal(
        `<div style="font-size:56px">📸</div>
         <h2 class="script">Đã mở hết kỷ niệm!</h2>
         <p>Vợ đã xem hết 8 khoảnh khắc. Mỗi tấm ảnh, mỗi lời nhắn đều là tình yêu chồng dành cho vợ. Cảm ơn vợ đã đồng hành đến đây ♥</p>`,
        [['Về trang chủ', () => show('home')]]
      );
    }
  }, 700);
}

/* ====== TRÒ 3: QUIZ ====== */
function quizData() {
  const d = daysSince();
  return [
    {
      q: 'Chúng mình chính thức yêu nhau vào ngày nào?',
      o: ['20/05/2026', '23/05/2026', '25/05/2026', '03/05/2026'],
      a: 1,
      e: 'Đúng rồi! 23/05/2026 – ngày chồng thành người hạnh phúc nhất 🥰'
    },
    {
      q: 'Sinh nhật của vợ yêu là ngày nào?',
      o: ['24/08/2011', '23/07/2011', '24/09/2011', '14/08/2011'],
      a: 0,
      e: 'Ngày 24/8 – ngày thế giới có thêm một thiên thần 🎂'
    },
    {
      q: 'Sinh nhật của chồng là ngày nào?',
      o: ['24/07/2008', '23/08/2008', '23/07/2008', '13/07/2008'],
      a: 2,
      e: 'Vợ nhớ sinh nhật chồng là chồng cảm động lắm đó 🥹'
    },
    {
      q: 'Người đẹp nhất thế giới trong mắt chồng là ai?',
      o: ['Phan Thị Thanh Tâm', 'Vợ Tâm của chồng', 'Cô gái đang cầm điện thoại này', 'Tất cả đáp án trên'],
      a: 3,
      e: 'Cả 3 đều là một người – đó là vợ yêu của chồng!'
    },
    {
      q: 'Vợ giận chồng thì chồng sẽ làm gì?',
      o: ['Đi ngủ luôn', 'Xin lỗi, ôm và dỗ vợ tới khi vợ cười', 'Im lặng chơi game', 'Giả vờ không biết'],
      a: 1,
      e: 'Chồng dại gì mà để vợ giận lâu 😤➡️🥰'
    },
    {
      q: `Tính đến hôm nay, mình đã yêu nhau được bao nhiêu ngày?`,
      o: [d - 10, d + 7, d, d + 30].map(String),
      a: 2,
      e: `Đúng ${d} ngày! Và chồng muốn cộng thêm thật nhiều ngày nữa ♥`
    },
    {
      q: 'Ai yêu ai nhiều hơn?',
      o: ['Chồng yêu vợ nhiều hơn', 'Vợ yêu chồng nhiều hơn', 'Hai đứa yêu nhau nhiều như nhau, nhiều vô cực'],
      a: 2,
      e: 'Yêu nhau bằng nhau, và nhiều đến vô cực 💞'
    },
    {
      q: 'Chồng sẽ ở bên cạnh vợ đến bao giờ?',
      o: ['Đến thứ Sáu', 'Đến khi hết tiền', 'Đến hết nhiệm kỳ', 'Mãi mãi'],
      a: 3,
      e: 'Mãi mãi, không có ngày hết hạn!'
    }
  ];
}

let qz = null;

function initQuiz() {
  qz = { list: quizData(), i: 0, score: 0 };
  renderQ();
}

function renderQ() {
  const { list, i } = qz, q = list[i];
  $('#quizNo').textContent = `${i + 1}/${list.length}`;
  const opts = shuffle(q.o.map((t, idx) => ({ t, ok: idx === q.a })));
  $('#quizBox').innerHTML = `
    <div class="qbar"><i style="width:${i / list.length * 100}%"></i></div>
    <div class="qtxt">${q.q}</div>
    <div id="opts"></div>
    <div id="ex"></div>`;
  opts.forEach(o => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.textContent = o.t;
    b.onclick = () => answer(b, o, opts, q);
    $('#opts').appendChild(b);
  });
}

function answer(btn, o, opts, q) {
  const bs = $$('#opts .opt');
  if (bs[0].disabled) return;
  bs.forEach(b => b.disabled = true);
  bs.forEach((b, k) => { if (opts[k].ok) b.classList.add('ok'); });
  if (o.ok) {
    qz.score++;
    sfx.good();
  } else {
    btn.classList.add('bad');
    sfx.bad();
  }
  $('#ex').innerHTML = `
    <div class="explain">${o.ok ? '✅ ' : '💭 '}${q.e}</div>
    <div class="center" style="margin-top:14px">
      <button class="btn" id="nx">${qz.i === qz.list.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}</button>
    </div>`;
  $('#nx').onclick = () => {
    qz.i++;
    qz.i >= qz.list.length ? quizEnd() : renderQ();
  };
}

function quizEnd() {
  const s = qz.score, n = qz.list.length, pass = s >= 6;
  if (pass) {
    S.done.quiz = true;
    save();
    sfx.win();
    burst(innerWidth / 2, innerHeight / 2, 80);
  }
  $('#quizBox').innerHTML = `
    <div class="center">
      <div style="font-size:56px">${pass ? '🥰' : '🥺'}</div>
      <h2 class="script">${s}/${n} điểm</h2>
      <p>${pass
        ? 'Vợ chồng mình đúng là thân thiết nhất quả đất! Chồng thương vợ nhiều lắm ♥'
        : 'Cần ít nhất 6 điểm để qua nhé vợ. Thử lại đi, chồng tin vợ làm được!'}</p>
      <button class="btn" id="qa">${pass ? 'Về trang chủ' : 'Làm lại'}</button>
    </div>`;
  $('#qa').onclick = () => pass ? show('home') : initQuiz();
}

/* ====== TRÒ 4: HỘP QUÀ ====== */
const COUPONS = [
  ['🤗', 'Phiếu 1 cái ôm thật chặt', 'Dùng ngay lập tức, chồng sẵn sàng 24/7.'],
  ['🍜', 'Phiếu đi ăn món vợ thích', 'Vợ chọn quán, chồng chọn ngồi đối diện ngắm vợ ăn.'],
  ['😤', 'Phiếu được hờn 5 phút', 'Sau 5 phút chồng sẽ dỗ. Có thể gia hạn thêm nếu chồng dỗ dở.'],
  ['👂', 'Phiếu chồng nghe vợ kể chuyện', 'Cả buổi, không ngắt lời, không nhìn điện thoại.'],
  ['📷', 'Phiếu thợ chụp ảnh riêng', 'Chồng chụp cho vợ đến khi vợ ưng mới thôi (không than mỏi tay).'],
  ['🌙', 'Phiếu chúc ngủ ngon mỗi tối', 'Có hiệu lực mỗi ngày, mỗi đêm, không ngày nghỉ.'],
  ['🌇', 'Phiếu ngắm hoàng hôn cùng nhau', 'Chồng mang theo mình, vợ mang theo nụ cười là đủ.'],
  ['🌠', 'Phiếu điều ước của vợ', 'Vợ ước gì, chồng sẽ cố gắng hết sức để thực hiện.'],
  ['👑', 'Phiếu "Vợ luôn đúng"', 'Điều 1: Vợ luôn đúng. Điều 2: Nếu vợ sai, xem lại điều 1.']
];

function initGift() {
  const g = $('#giftGrid');
  g.innerHTML = '';
  COUPONS.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'gbox' + (S.gifts.includes(i) ? ' open' : '');
    b.textContent = S.gifts.includes(i) ? c[0] : '🎁';
    b.onclick = () => openGift(i, b);
    g.appendChild(b);
  });
  updGift();
}

function updGift() {
  $('#giftCount').textContent = S.gifts.length + '/9';
}

function openGift(i, b) {
  const c = COUPONS[i];
  sfx.good();
  burst(innerWidth / 2, innerHeight / 2, 35);
  if (!S.gifts.includes(i)) {
    S.gifts.push(i);
    if (S.gifts.length === 9) S.done.gift = true;
    save();
  }
  b.classList.add('open');
  b.textContent = c[0];
  updGift();
  modal(
    `<div style="font-size:56px">${c[0]}</div>
     <h2 class="script">${c[1]}</h2>
     <p>${c[2]}</p>
     <p class="hint">Dành riêng cho Phan Thị Thanh Tâm ♥<br>Ký tên: Chồng Nguyễn Tiến Vũ</p>`,
    [['Cảm ơn chồng ♥']]
  );
}

/* ====== LÁ THƯ ====== */
let typing = null;

function letterBody() {
  return `Gửi vợ yêu của chồng, Phan Thị Thanh Tâm,

Hôm nay là ngày thứ ${daysSince()} mình yêu nhau. Chồng vụng về lắm, nói bằng lời thì hay ngại, nên chồng viết ra đây để vợ đọc nhé.

Cảm ơn vợ đã xuất hiện trong cuộc đời chồng. Vợ là điều tuyệt vời nhất mà chồng từng có.

Cảm ơn vì những buổi hẹn hò, những ly nước mình ngồi uống cùng nhau, những lần vợ chống cằm nhìn chồng, những buổi hoàng hôn mình cùng ngắm và từng tấm ảnh mình chụp chung. Với chồng, mỗi khoảnh khắc đó đều là báu vật.

Chồng biết đôi lúc chồng còn ngốc, còn làm vợ buồn. Chồng hứa sẽ học cách tốt hơn mỗi ngày: biết lắng nghe hơn, biết nhường vợ hơn và biết dỗ vợ nhanh hơn.

Mình còn trẻ, phía trước là cả một hành trình dài: học hành, ước mơ, trưởng thành. Chồng muốn cùng vợ đi hết quãng đường ấy. Vợ vui thì chồng vui, vợ mệt thì đã có vai chồng ở đây.

Hãy luôn là chính mình nhé vợ. Chồng sẽ luôn ở đây, ủng hộ và yêu vợ mãi mãi.

Yêu vợ nhất trên đời,`;
}

function initLetter() {
  const el = $('#letterText'), txt = letterBody();
  el.textContent = '';
  $('#afterLetter').classList.add('hidden');
  clearInterval(typing);
  let i = 0;
  const finish = () => {
    clearInterval(typing);
    el.innerHTML = '';
    el.append(document.createTextNode(txt));
    el.insertAdjacentHTML('beforeend', '\n<span class="sign">Chồng Nguyễn Tiến Vũ ♥</span>');
    $('#afterLetter').classList.remove('hidden');
    if (!S.done.letter) {
      S.done.letter = true;
      save();
      sfx.win();
      burst(innerWidth / 2, innerHeight / 3, 110);
    }
  };
  typing = setInterval(() => {
    i += 2;
    el.textContent = txt.slice(0, i);
    if (i >= txt.length) finish();
  }, 26);
  el.onclick = finish;
}

$('#replayHearts').onclick = () => {
  sfx.win();
  burst(innerWidth / 2, innerHeight / 2, 130);
};
