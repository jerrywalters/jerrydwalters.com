// Subtle, slowly-drifting starfield behind the whole umbrella.
// Crisp pixel "+" stars, but positions snapped to the DEVICE-pixel grid (much
// finer than the art-pixel grid), so the slow sky-drift stays smooth without
// going fully soft. Theme-aware colored stars, livelier twinkle, the occasional
// faint shooting star, respects prefers-reduced-motion, pauses when tab hidden.

interface StarColor {
  rgb: [number, number, number];
  weight: number;
}

const ROT_SPEED = 0.00055; // rad/sec — gentle sky drift
const DENSITY = 1 / 6500; // visible stars per CSS px²
const MAX_STARS = 2200;

// Shooting-star cadence (seconds): wait until the first, then a gap between.
const METEOR_FIRST: [number, number] = [15, 40];
const METEOR_GAP: [number, number] = [90, 220];

// Stellar colours, same order in both themes so a star keeps its identity when
// you toggle. Dark = luminous tints on near-black; light = deeper, more
// saturated tints that read against the off-white.
const DARK_COLORS: StarColor[] = [
  { rgb: [240, 244, 255], weight: 30 }, // white / blue-white
  { rgb: [150, 190, 255], weight: 22 }, // blue
  { rgb: [255, 222, 170], weight: 18 }, // gold
  { rgb: [255, 176, 198], weight: 16 }, // rose
  { rgb: [168, 250, 232], weight: 14 }, // cyan / teal
];
const LIGHT_COLORS: StarColor[] = [
  { rgb: [84, 98, 132], weight: 30 }, // slate blue-grey
  { rgb: [52, 104, 198], weight: 22 }, // blue
  { rgb: [176, 122, 40], weight: 18 }, // amber
  { rgb: [186, 78, 122], weight: 16 }, // rose
  { rgb: [38, 140, 128], weight: 14 }, // teal
];

interface Star {
  r: number;
  cosA: number;
  sinA: number;
  colorIdx: number;
  size: 0 | 1 | 2; // 0 = dot, 1 = +, 2 = big + with outer arms + diagonals
  baseAlpha: number;
  twAmp: number;
  twSpeed: number;
  twPhase: number;
}

interface Meteor {
  x0: number; // start, CSS px
  y0: number;
  vx: number; // velocity, CSS px/sec
  vy: number;
  nx: number; // unit direction
  ny: number;
  spawnT: number;
  dur: number;
  len: number; // trail length, CSS px
}

const isLight = () => document.documentElement.dataset.theme === 'light';

export function initStarfield(): void {
  const canvas = document.getElementById('starfield') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

  let dpr = 1;
  let cssW = 0;
  let cssH = 0;
  let pivotX = 0;
  let pivotY = 0;
  let unit = 2; // pixel-block size in DEVICE px (the "chunkiness")
  let stars: Star[] = [];
  let meteors: Meteor[] = [];
  let nextMeteorT = rand(METEOR_FIRST[0], METEOR_FIRST[1]);
  let colors: StarColor[] = isLight() ? LIGHT_COLORS : DARK_COLORS;
  let maxAlpha = isLight() ? 0.58 : 0.5;
  const startT = performance.now();
  let running = true;

  function applyTheme() {
    const light = isLight();
    colors = light ? LIGHT_COLORS : DARK_COLORS;
    maxAlpha = light ? 0.58 : 0.5;
  }

  function pickColor(): number {
    const total = colors.reduce((s, c) => s + c.weight, 0);
    let x = Math.random() * total;
    for (let i = 0; i < colors.length; i++) {
      x -= colors[i].weight;
      if (x <= 0) return i;
    }
    return 0;
  }

  function spawnMeteor(t: number) {
    const dir = Math.random() < 0.5 ? 1 : -1; // left or right
    const slope = rand(0.1, 0.4); // radians below horizontal
    const nx = dir * Math.cos(slope);
    const ny = Math.sin(slope); // +y is downward on screen
    const speed = rand(0.22, 0.34) * cssW; // px/sec → travels ~a quarter screen
    meteors.push({
      x0: dir > 0 ? rand(0.05, 0.5) * cssW : rand(0.5, 0.95) * cssW,
      y0: rand(0.06, 0.42) * cssH,
      vx: nx * speed,
      vy: ny * speed,
      nx,
      ny,
      spawnT: t,
      dur: rand(0.7, 1.2),
      len: rand(20, 42),
    });
  }

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = window.innerWidth;
    cssH = window.innerHeight;
    // Draw in DEVICE pixels (identity transform) so blocks land on the device
    // grid and stay crisp; positions snap to whole device px → fine, smooth steps.
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx!.setTransform(1, 0, 0, 1, 0, 0);
    ctx!.imageSmoothingEnabled = false;
    unit = Math.max(3, Math.round(2.6 * dpr)); // ~2.6 CSS px chunk
    meteors = [];

    // Pivot off the bottom-right corner → rotation reads as a slow one-way arc.
    pivotX = cssW * 1.25;
    pivotY = cssH * 1.4;
    const rMin = Math.hypot(pivotX - cssW, pivotY - cssH);
    const rMax = Math.hypot(pivotX, pivotY);
    const count = Math.min(MAX_STARS, Math.round(Math.PI * (rMax * rMax - rMin * rMin) * DENSITY));

    stars = [];
    for (let i = 0; i < count; i++) {
      const rr = Math.sqrt(rMin * rMin + Math.random() * (rMax * rMax - rMin * rMin));
      const a = rand(0, Math.PI * 2);
      const roll = Math.random();
      const size: 0 | 1 | 2 = roll > 0.9 ? 2 : roll > 0.66 ? 1 : 0;
      stars.push({
        r: rr,
        cosA: Math.cos(a),
        sinA: Math.sin(a),
        colorIdx: pickColor(),
        size,
        baseAlpha: rand(0.4, 1) * (size === 0 ? 0.8 : 1),
        twAmp: rand(0.4, 0.95),
        twSpeed: rand(0.6, 2.4),
        twPhase: rand(0, Math.PI * 2),
      });
    }
  }

  function block(dx: number, dy: number, a: number, rgb: [number, number, number]) {
    if (a <= 0.004) return;
    ctx!.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
    ctx!.fillRect(dx, dy, unit, unit);
  }

  function drawStar(cx: number, cy: number, size: number, alpha: number, rgb: [number, number, number]) {
    const h = unit >> 1;
    const u = unit;
    block(cx - h, cy - h, alpha, rgb); // bright core
    if (size >= 1) {
      const a1 = alpha * 0.5;
      block(cx - h - u, cy - h, a1, rgb);
      block(cx - h + u, cy - h, a1, rgb);
      block(cx - h, cy - h - u, a1, rgb);
      block(cx - h, cy - h + u, a1, rgb);
    }
    if (size >= 2) {
      const a2 = alpha * 0.24;
      block(cx - h - 2 * u, cy - h, a2, rgb);
      block(cx - h + 2 * u, cy - h, a2, rgb);
      block(cx - h, cy - h - 2 * u, a2, rgb);
      block(cx - h, cy - h + 2 * u, a2, rgb);
      const a3 = alpha * 0.12; // faint diagonal glints
      block(cx - h - u, cy - h - u, a3, rgb);
      block(cx - h + u, cy - h - u, a3, rgb);
      block(cx - h - u, cy - h + u, a3, rgb);
      block(cx - h + u, cy - h + u, a3, rgb);
    }
  }

  function drawMeteors(t: number) {
    if (reduce) return;
    if (t >= nextMeteorT) {
      spawnMeteor(t);
      if (Math.random() < 0.25) spawnMeteor(t); // occasionally a pair
      nextMeteorT = t + rand(METEOR_GAP[0], METEOR_GAP[1]);
    }
    const c = colors[0].rgb; // brightest star colour
    const peak = isLight() ? 0.5 : 0.85;
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      const age = t - m.spawnT;
      if (age > m.dur) {
        meteors.splice(i, 1);
        continue;
      }
      const env = Math.sin((age / m.dur) * Math.PI); // 0 → 1 → 0: appear & vanish
      const a = peak * env;
      if (a <= 0.01) continue;

      const hx = (m.x0 + m.vx * age) * dpr;
      const hy = (m.y0 + m.vy * age) * dpr;
      const tx = hx - m.nx * m.len * dpr;
      const ty = hy - m.ny * m.len * dpr;
      const grad = ctx!.createLinearGradient(tx, ty, hx, hy);
      grad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      grad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},${a})`);
      ctx!.strokeStyle = grad;
      ctx!.lineWidth = 1.4 * dpr;
      ctx!.lineCap = 'round';
      ctx!.beginPath();
      ctx!.moveTo(tx, ty);
      ctx!.lineTo(hx, hy);
      ctx!.stroke();
      // tiny bright head
      ctx!.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
      ctx!.fillRect(Math.round(hx) - dpr, Math.round(hy) - dpr, 2 * dpr, 2 * dpr);
    }
  }

  function draw(t: number) {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    const ang = reduce ? 0 : t * ROT_SPEED;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);

    for (const s of stars) {
      const x = pivotX + s.r * (s.cosA * cos - s.sinA * sin);
      const y = pivotY + s.r * (s.sinA * cos + s.cosA * sin);
      if (x < -8 || y < -8 || x > cssW + 8 || y > cssH + 8) continue;

      // two flicker frequencies → a livelier, less regular twinkle
      const tw = reduce
        ? 0.8
        : 0.5 +
          0.34 * Math.sin(t * s.twSpeed + s.twPhase) +
          0.16 * Math.sin(t * s.twSpeed * 2.7 + s.twPhase * 1.6);
      const alpha = maxAlpha * s.baseAlpha * tw;
      if (alpha <= 0.004) continue;

      // snap centre to the device-pixel grid → crisp blocks, fine motion steps
      const cx = Math.round(x * dpr);
      const cy = Math.round(y * dpr);
      drawStar(cx, cy, s.size, alpha, colors[s.colorIdx].rgb);
    }

    drawMeteors(t);
  }

  function frame(now: number) {
    if (!running) return;
    draw((now - startT) / 1000);
    requestAnimationFrame(frame);
  }

  new MutationObserver(() => {
    applyTheme();
    if (reduce) draw((performance.now() - startT) / 1000);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let resizeTimer: number | undefined;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      build();
      if (reduce) draw((performance.now() - startT) / 1000);
    }, 200);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
    } else if (!reduce && !running) {
      running = true;
      requestAnimationFrame(frame);
    }
  });

  applyTheme();
  build();
  if (reduce) draw(0);
  else requestAnimationFrame(frame);
}
