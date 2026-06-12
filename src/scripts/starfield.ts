// Subtle, slowly-drifting starfield behind the whole umbrella.
// Smooth sub-pixel "sky rotation" drift (like stars wheeling overnight),
// theme-aware colored stars, respects prefers-reduced-motion, pauses when
// the tab is hidden.

interface StarColor {
  rgb: [number, number, number];
  weight: number;
}

const ROT_SPEED = 0.00055; // rad/sec — gentle sky drift
const DENSITY = 1 / 6500; // visible stars per CSS px²
const MAX_STARS = 2200;
const BRIGHT_CHANCE = 0.1; // fraction that get diffraction spikes

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
  bright: boolean;
  scale: number;
  baseAlpha: number;
  twAmp: number;
  twSpeed: number;
  twPhase: number;
}

interface Sprite {
  canvas: HTMLCanvasElement;
  size: number;
}

const isLight = () => document.documentElement.dataset.theme === 'light';

// Pre-render a star to an offscreen canvas once; drawing it at sub-pixel
// positions (with smoothing) is what makes the drift glide instead of jump.
function makeSprite(rgb: [number, number, number], bright: boolean, light: boolean): Sprite {
  const size = bright ? 40 : 16;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;
  const [r, gn, b] = rgb;

  const coreR = bright ? 5.5 : 3.4;
  const glow = g.createRadialGradient(cx, cy, 0, cx, cy, coreR);
  glow.addColorStop(0, `rgba(${r},${gn},${b},1)`);
  glow.addColorStop(0.45, `rgba(${r},${gn},${b},0.55)`);
  glow.addColorStop(1, `rgba(${r},${gn},${b},0)`);
  g.fillStyle = glow;
  g.fillRect(0, 0, size, size);

  if (bright) {
    const len = size / 2 - 1;
    g.lineCap = 'round';
    g.lineWidth = 1.1;
    const ends: [number, number][] = [
      [cx, cy - len],
      [cx, cy + len],
      [cx - len, cy],
      [cx + len, cy],
    ];
    for (const [x2, y2] of ends) {
      const sg = g.createLinearGradient(cx, cy, x2, y2);
      sg.addColorStop(0, `rgba(${r},${gn},${b},0.8)`);
      sg.addColorStop(1, `rgba(${r},${gn},${b},0)`);
      g.strokeStyle = sg;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(x2, y2);
      g.stroke();
    }
    // hot white core for dark mode only (would look wrong on a light bg)
    if (!light) {
      const hot = g.createRadialGradient(cx, cy, 0, cx, cy, 2.4);
      hot.addColorStop(0, 'rgba(255,255,255,0.95)');
      hot.addColorStop(1, `rgba(${r},${gn},${b},0)`);
      g.fillStyle = hot;
      g.fillRect(0, 0, size, size);
    }
  }
  return { canvas: c, size };
}

export function initStarfield(): void {
  const canvas = document.getElementById('starfield') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

  let cssW = 0;
  let cssH = 0;
  let pivotX = 0;
  let pivotY = 0;
  let stars: Star[] = [];
  let colors: StarColor[] = isLight() ? LIGHT_COLORS : DARK_COLORS;
  let maxAlpha = isLight() ? 0.6 : 0.55;
  let sprites: Sprite[][] = [];
  const startT = performance.now();
  let running = true;

  function buildSprites() {
    const light = isLight();
    colors = light ? LIGHT_COLORS : DARK_COLORS;
    maxAlpha = light ? 0.6 : 0.55;
    sprites = colors.map((col) => [
      makeSprite(col.rgb, false, light),
      makeSprite(col.rgb, true, light),
    ]);
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

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = window.innerWidth;
    cssH = window.innerHeight;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

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
      const bright = Math.random() < BRIGHT_CHANCE;
      stars.push({
        r: rr,
        cosA: Math.cos(a),
        sinA: Math.sin(a),
        colorIdx: pickColor(),
        bright,
        scale: bright ? rand(0.7, 1.15) : rand(0.55, 1.1),
        baseAlpha: rand(0.35, 1) * (bright ? 1 : 0.85),
        twAmp: rand(0.4, 0.95),
        twSpeed: rand(0.6, 2.4),
        twPhase: rand(0, Math.PI * 2),
      });
    }
  }

  function draw(t: number) {
    ctx!.clearRect(0, 0, cssW, cssH);
    const ang = reduce ? 0 : t * ROT_SPEED;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);

    for (const s of stars) {
      const x = pivotX + s.r * (s.cosA * cos - s.sinA * sin);
      const y = pivotY + s.r * (s.sinA * cos + s.cosA * sin);
      if (x < -30 || y < -30 || x > cssW + 30 || y > cssH + 30) continue;

      // two flicker frequencies → a livelier, less regular twinkle
      const tw = reduce
        ? 0.8
        : 0.5 +
          0.34 * Math.sin(t * s.twSpeed + s.twPhase) +
          0.16 * Math.sin(t * s.twSpeed * 2.7 + s.twPhase * 1.6);
      const alpha = maxAlpha * s.baseAlpha * (1 - s.twAmp + s.twAmp * tw);
      if (alpha <= 0.004) continue;

      const sp = sprites[s.colorIdx][s.bright ? 1 : 0];
      const d = sp.size * s.scale;
      ctx!.globalAlpha = alpha;
      ctx!.drawImage(sp.canvas, x - d / 2, y - d / 2, d, d);
    }
    ctx!.globalAlpha = 1;
  }

  function frame(now: number) {
    if (!running) return;
    draw((now - startT) / 1000);
    requestAnimationFrame(frame);
  }

  new MutationObserver(() => {
    buildSprites();
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

  buildSprites();
  build();
  if (reduce) draw(0);
  else requestAnimationFrame(frame);
}
