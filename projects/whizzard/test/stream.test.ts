import { describe, it, expect } from 'vitest';
import { emit, initialEmit } from '../src/sim/stream';
import { makeRng } from '../src/sim/rng';
import type { Vec3 } from '../src/sim/types';
import { EMIT_RATE_MAX, WOBBLE_START, SPUTTER_START, NOZZLE_HEIGHT, NOZZLE_FORWARD } from '../src/tuning';

const origin: Vec3 = { x: 0, y: NOZZLE_HEIGHT, z: NOZZLE_FORWARD };

function emitOver(seconds: number, pressure: number, panic = 0, dt = 1 / 120) {
  const rng = makeRng(1234);
  const st = initialEmit();
  const seeds = [];
  for (let t = 0; t < seconds; t += dt) {
    seeds.push(...emit({ pressure, panic, yaw: 0, origin, dt }, rng, st));
  }
  return seeds;
}

describe('emit', () => {
  it('emits nothing at zero pressure', () => {
    expect(emitOver(1, 0).length).toBe(0);
  });

  it('approximates EMIT_RATE_MAX droplets/sec at full pressure', () => {
    const n = emitOver(1, 1).length;
    expect(n).toBeGreaterThan(EMIT_RATE_MAX * 0.85);
    expect(n).toBeLessThan(EMIT_RATE_MAX * 1.15);
  });

  it('emits far fewer droplets in the sputter regime', () => {
    const full = emitOver(1, 1).length;
    const sputter = emitOver(1, SPUTTER_START * 0.5).length;
    expect(sputter).toBeLessThan(full * 0.5);
  });

  it('sputter droplets are visually fatter (scale > 1)', () => {
    const seeds = emitOver(1, SPUTTER_START * 0.5);
    expect(seeds.some((s) => s.scale > 1)).toBe(true);
  });

  it('high pressure widens the horizontal spread (wobble)', () => {
    const calm = emitOver(0.5, WOBBLE_START - 0.05);
    const wobbly = emitOver(0.5, 1);
    const spread = (seeds: { vx: number }[]) => {
      const xs = seeds.map((s) => s.vx);
      const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
      return Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length);
    };
    expect(spread(wobbly)).toBeGreaterThan(spread(calm));
  });

  it('panic widens spread even further', () => {
    const wobbly = emitOver(0.5, 1, 0);
    const panicked = emitOver(0.5, 1, 1);
    const spread = (seeds: { vx: number }[]) => {
      const xs = seeds.map((s) => s.vx);
      const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
      return Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length);
    };
    expect(spread(panicked)).toBeGreaterThan(spread(wobbly));
  });

  it('is deterministic for a fixed seed', () => {
    const a = emitOver(0.3, 1);
    const b = emitOver(0.3, 1);
    expect(a).toEqual(b);
  });
});
