import { describe, it, expect } from 'vitest';
import { DropletPool } from '../src/sim/pool';
import type { DropletSeed } from '../src/sim/types';

const seed = (px = 0): DropletSeed => ({ px, py: 1, pz: 0, vx: 0, vy: 0, vz: 1, vol: 1, scale: 1 });

describe('DropletPool', () => {
  it('spawns into free slots and marks them alive', () => {
    const pool = new DropletPool(4);
    const i = pool.spawn(seed());
    expect(i).toBeGreaterThanOrEqual(0);
    expect(pool.droplets[i].alive).toBe(true);
    expect(pool.aliveCount).toBe(1);
  });

  it('returns -1 when full and does not overwrite', () => {
    const pool = new DropletPool(2);
    expect(pool.spawn(seed())).toBeGreaterThanOrEqual(0);
    expect(pool.spawn(seed())).toBeGreaterThanOrEqual(0);
    expect(pool.spawn(seed())).toBe(-1);
    expect(pool.aliveCount).toBe(2);
  });

  it('kill frees a slot for reuse', () => {
    const pool = new DropletPool(1);
    const i = pool.spawn(seed());
    pool.kill(i);
    expect(pool.aliveCount).toBe(0);
    const j = pool.spawn(seed(9));
    expect(j).toBe(i);
    expect(pool.droplets[j].px).toBe(9);
  });

  it('copies seed values into the slot', () => {
    const pool = new DropletPool(1);
    const i = pool.spawn({ px: 1, py: 2, pz: 3, vx: 4, vy: 5, vz: 6, vol: 7, scale: 8 });
    const d = pool.droplets[i];
    expect([d.px, d.py, d.pz, d.vx, d.vy, d.vz, d.vol, d.scale]).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
