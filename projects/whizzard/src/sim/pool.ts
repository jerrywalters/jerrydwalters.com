import type { Droplet, DropletSeed } from './types';

/** Pre-allocated droplet store with a freelist — no per-frame allocation. */
export class DropletPool {
  readonly droplets: Droplet[];
  private readonly free: number[];
  aliveCount = 0;

  constructor(readonly cap: number) {
    this.droplets = new Array(cap);
    this.free = new Array(cap);
    for (let i = 0; i < cap; i++) {
      this.droplets[i] = { alive: false, px: 0, py: 0, pz: 0, vx: 0, vy: 0, vz: 0, vol: 0, scale: 1 };
      this.free[i] = cap - 1 - i; // pop from the end → indices issued low-first
    }
  }

  spawn(s: DropletSeed): number {
    const i = this.free.pop();
    if (i === undefined) return -1;
    const d = this.droplets[i];
    d.alive = true;
    d.px = s.px; d.py = s.py; d.pz = s.pz;
    d.vx = s.vx; d.vy = s.vy; d.vz = s.vz;
    d.vol = s.vol; d.scale = s.scale;
    this.aliveCount++;
    return i;
  }

  kill(i: number): void {
    const d = this.droplets[i];
    if (!d.alive) return;
    d.alive = false;
    this.free.push(i);
    this.aliveCount--;
  }
}
