// Subtle, slowly-rotating pixel starfield behind the whole umbrella.
// Theme-aware (dark/light), low-contrast, crisp pixels, respects
// prefers-reduced-motion, pauses when the tab is hidden.

interface Star {
  r: number; // polar radius from the off-screen rotation pivot (art-pixels)
  cosA: number;
  sinA: number;
  size: 0 | 1 | 2; // 0 = dot, 1 = small +, 2 = big + (with optional ring)
  baseAlpha: number;
  twAmp: number; // twinkle depth (0..1)
  twSpeed: number;
  twPhase: number;
  tint: [number, number, number] | null;
  ring: boolean;
}

const PIXEL = 2; // art-pixel size in CSS px (chunkiness)
const ROT_SPEED = 0.0009; // rad/sec — a slow rotating sky
const DENSITY = 1 / 2600; // visible stars per art-pixel²
const MAX_STARS = 4000;

const TINTS: [number, number, number][] = [
  [120, 200, 255], // cool blue
  [255, 184, 140], // warm
  [255, 150, 200], // pink
  [160, 255, 180], // green
];

function palette(theme: string) {
  if (theme === 'light') {
    // faint specks slightly darker than the off-white background
    return { base: [70, 86, 96] as [number, number, number], maxAlpha: 0.16, tintChance: 0 };
  }
  // soft cyan-white just above the near-black background
  return { base: [198, 226, 226] as [number, number, number], maxAlpha: 0.5, tintChance: 0.12 };
}

export function initStarfield(): void {
  const canvas = document.getElementById('starfield') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

  let cw = 0;
  let ch = 0;
  let pivotX = 0;
  let pivotY = 0;
  let stars: Star[] = [];
  let pal = palette(document.documentElement.dataset.theme || 'dark');
  const start = performance.now();
  let running = true;

  function build() {
    cw = Math.max(1, Math.ceil(window.innerWidth / PIXEL));
    ch = Math.max(1, Math.ceil(window.innerHeight / PIXEL));
    canvas.width = cw;
    canvas.height = ch;
    ctx!.imageSmoothingEnabled = false;

    // Pivot off the bottom-right corner so rotation reads as a gentle arc.
    pivotX = cw * 1.25;
    pivotY = ch * 1.35;

    // Scatter over the annulus that the viewport sweeps, so density stays
    // uniform at any rotation. Nearest viewport point is the (cw,ch) corner.
    const rMin = Math.hypot(pivotX - cw, pivotY - ch);
    const rMax = Math.hypot(pivotX, pivotY); // pivot → (0,0), farthest corner
    const ringArea = Math.PI * (rMax * rMax - rMin * rMin);
    const count = Math.min(MAX_STARS, Math.round(ringArea * DENSITY));

    stars = [];
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(rMin * rMin + Math.random() * (rMax * rMax - rMin * rMin));
      const a = rand(0, Math.PI * 2);
      const roll = Math.random();
      const size: 0 | 1 | 2 = roll > 0.95 ? 2 : roll > 0.78 ? 1 : 0;
      stars.push({
        r,
        cosA: Math.cos(a),
        sinA: Math.sin(a),
        size,
        baseAlpha: rand(0.25, 1) * (size === 0 ? 0.6 : 1),
        twAmp: rand(0.3, 0.9),
        twSpeed: rand(0.6, 2.2),
        twPhase: rand(0, Math.PI * 2),
        tint: Math.random() < pal.tintChance ? TINTS[(Math.random() * TINTS.length) | 0] : null,
        ring: size === 2 && Math.random() < 0.25,
      });
    }
  }

  function dot(x: number, y: number, alpha: number, c: [number, number, number]) {
    if (alpha <= 0.003 || x < 0 || y < 0 || x >= cw || y >= ch) return;
    ctx!.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
    ctx!.fillRect(x, y, 1, 1);
  }

  function draw(tSec: number) {
    ctx!.clearRect(0, 0, cw, ch);
    const angle = reduce ? 0 : tSec * ROT_SPEED;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    for (const s of stars) {
      const x = pivotX + s.r * (s.cosA * cos - s.sinA * sin);
      const y = pivotY + s.r * (s.sinA * cos + s.cosA * sin);
      if (x < -4 || y < -4 || x > cw + 4 || y > ch + 4) continue;

      const tw = reduce ? 0.7 : 0.5 + 0.5 * Math.sin(tSec * s.twSpeed + s.twPhase);
      const alpha = pal.maxAlpha * s.baseAlpha * (1 - s.twAmp + s.twAmp * tw);
      const c = s.tint ?? pal.base;
      const ix = x | 0;
      const iy = y | 0;

      dot(ix, iy, alpha, c);
      if (s.size >= 1) {
        const a1 = alpha * 0.45;
        dot(ix - 1, iy, a1, c);
        dot(ix + 1, iy, a1, c);
        dot(ix, iy - 1, a1, c);
        dot(ix, iy + 1, a1, c);
      }
      if (s.size >= 2) {
        const a2 = alpha * 0.2;
        dot(ix - 2, iy, a2, c);
        dot(ix + 2, iy, a2, c);
        dot(ix, iy - 2, a2, c);
        dot(ix, iy + 2, a2, c);
        if (s.ring) {
          const ar = alpha * 0.1;
          dot(ix - 3, iy, ar, c);
          dot(ix + 3, iy, ar, c);
          dot(ix, iy - 3, ar, c);
          dot(ix, iy + 3, ar, c);
          dot(ix - 2, iy - 2, ar, c);
          dot(ix + 2, iy - 2, ar, c);
          dot(ix - 2, iy + 2, ar, c);
          dot(ix + 2, iy + 2, ar, c);
        }
      }
    }
  }

  function frame(now: number) {
    if (!running) return;
    draw((now - start) / 1000);
    requestAnimationFrame(frame);
  }

  new MutationObserver(() => {
    pal = palette(document.documentElement.dataset.theme || 'dark');
    for (const s of stars) {
      s.tint = Math.random() < pal.tintChance ? TINTS[(Math.random() * TINTS.length) | 0] : null;
    }
    if (reduce) draw((performance.now() - start) / 1000);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let resizeTimer: number | undefined;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      build();
      if (reduce) draw((performance.now() - start) / 1000);
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

  build();
  if (reduce) draw(0);
  else requestAnimationFrame(frame);
}
