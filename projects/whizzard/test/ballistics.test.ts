import { describe, it, expect } from 'vitest';
import { integrate, predictLanding, launchVelocity } from '../src/sim/ballistics';
import { DropletPool } from '../src/sim/pool';
import type { Container, Rect } from '../src/sim/types';
import { NOZZLE_HEIGHT, NOZZLE_FORWARD } from '../src/tuning';

const origin = { x: 0, y: NOZZLE_HEIGHT, z: NOZZLE_FORWARD };

describe('predictLanding', () => {
  it('lands farther with more pressure (monotonic)', () => {
    const ranges = [0, 0.25, 0.5, 0.75, 1].map((p) => predictLanding(p, 0, origin).z);
    for (let i = 1; i < ranges.length; i++) expect(ranges[i]).toBeGreaterThan(ranges[i - 1]);
  });

  it('full charge lands ~6 m out (tuning anchor)', () => {
    const z = predictLanding(1, 0, origin).z;
    expect(z).toBeGreaterThan(5.0);
    expect(z).toBeLessThan(6.6);
  });

  it('yaw deflects the landing point sideways', () => {
    const straight = predictLanding(1, 0, origin);
    const right = predictLanding(1, Math.PI / 8, origin);
    expect(Math.abs(right.x)).toBeGreaterThan(Math.abs(straight.x));
  });
});

describe('integrate', () => {
  function cup(over: Partial<Container> = {}): Container {
    return { id: 'c', kind: 'cup', px: 0, py: 0, pz: 2, rimRadius: 0.3, rimHeight: 0.4, capacity: 100, fill: 0, ...over };
  }

  it('captures a droplet that crosses the rim inside the radius', () => {
    const pool = new DropletPool(8);
    const c = cup();
    // start just above the rim, moving straight down, directly over the cup
    pool.spawn({ px: 0, py: 0.5, pz: 2, vx: 0, vy: -2, vz: 0, vol: 5, scale: 1 });
    const r = integrate(pool, [c], [], 1 / 60);
    expect(r.capturedVolume).toBe(5);
    expect(c.fill).toBe(5);
    expect(pool.aliveCount).toBe(0);
  });

  it('a droplet outside the rim radius is not captured', () => {
    const pool = new DropletPool(8);
    const c = cup();
    pool.spawn({ px: 1.0, py: 0.5, pz: 2, vx: 0, vy: -2, vz: 0, vol: 5, scale: 1 });
    const r = integrate(pool, [c], [], 1 / 60);
    expect(r.capturedVolume).toBe(0);
    expect(c.fill).toBe(0);
  });

  it('overflow past capacity is counted as spill, not capture', () => {
    const pool = new DropletPool(8);
    const c = cup({ capacity: 3, fill: 0 });
    pool.spawn({ px: 0, py: 0.5, pz: 2, vx: 0, vy: -2, vz: 0, vol: 10, scale: 1 });
    const r = integrate(pool, [c], [], 1 / 60);
    expect(c.fill).toBe(3);
    expect(r.capturedVolume).toBe(3);
    expect(r.spilledVolume).toBe(7);
  });

  it('a droplet reaching the floor is spilled', () => {
    const pool = new DropletPool(8);
    pool.spawn({ px: 3, py: 0.1, pz: 1, vx: 0, vy: -2, vz: 0, vol: 4, scale: 1 });
    const r = integrate(pool, [], [], 1 / 60);
    expect(r.spilledVolume).toBe(4);
    expect(pool.aliveCount).toBe(0);
  });

  it('a floor hit inside a hazard rect flags hazardHit', () => {
    const pool = new DropletPool(8);
    const rug: Rect = { x0: -1, z0: 0.5, x1: 1, z1: 1.5 };
    pool.spawn({ px: 0, py: 0.05, pz: 1, vx: 0, vy: -2, vz: 0, vol: 4, scale: 1 });
    const r = integrate(pool, [], [rug], 1 / 60);
    expect(r.hazardHit).toBe(true);
  });

  it('applies gravity (a level-launched droplet falls)', () => {
    const pool = new DropletPool(8);
    const i = pool.spawn({ px: 0, py: 5, pz: 0, vx: 0, vy: 0, vz: 1, vol: 1, scale: 1 });
    integrate(pool, [], [], 1 / 60);
    expect(pool.droplets[i].vy).toBeLessThan(0);
    expect(pool.droplets[i].py).toBeLessThan(5);
  });
});

describe('launchVelocity', () => {
  it('higher pressure → greater speed', () => {
    const lo = launchVelocity(0.2, 0);
    const hi = launchVelocity(1, 0);
    const speed = (v: { x: number; y: number; z: number }) => Math.hypot(v.x, v.y, v.z);
    expect(speed(hi)).toBeGreaterThan(speed(lo));
  });
});
