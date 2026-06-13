import type { DropletSeed, Vec3 } from './types';
import type { Rng } from './rng';
import { launchVelocity } from './ballistics';
import {
  EMIT_RATE_MAX, EMIT_RATE_SPUTTER, SPUTTER_START, SPUTTER_JITTER,
  WOBBLE_START, WOBBLE_MAX_DEG, PANIC_WOBBLE_DEG,
  DROPLET_VOLUME, DROPLET_SCALE, SPUTTER_SCALE,
} from '../tuning';

export interface EmitParams {
  pressure: number;  // 0..1 (caller passes 0 when not flowing → no emission)
  panic: number;     // 0..1
  yaw: number;       // radians
  origin: Vec3;
  dt: number;
}

export interface EmitState { acc: number } // fractional-droplet carry

export function initialEmit(): EmitState { return { acc: 0 }; }

const DEG = Math.PI / 180;

export function emit(p: EmitParams, rng: Rng, st: EmitState): DropletSeed[] {
  if (p.pressure <= 0) { st.acc = 0; return []; }

  const sputter = p.pressure < SPUTTER_START;
  const rate = sputter ? EMIT_RATE_SPUTTER : EMIT_RATE_MAX * p.pressure;
  st.acc += rate * p.dt;

  const out: DropletSeed[] = [];
  // Wobble: yaw noise ramps in above WOBBLE_START, plus panic.
  const wobbleDeg =
    (p.pressure > WOBBLE_START ? ((p.pressure - WOBBLE_START) / (1 - WOBBLE_START)) * WOBBLE_MAX_DEG : 0) +
    p.panic * PANIC_WOBBLE_DEG;

  while (st.acc >= 1) {
    st.acc -= 1;
    const yaw = p.yaw + rng.range(-wobbleDeg, wobbleDeg) * DEG;
    const v = launchVelocity(p.pressure, yaw);
    if (sputter) {
      const j = SPUTTER_JITTER;
      v.x *= 1 + rng.range(-j, j); v.y *= 1 + rng.range(-j, j); v.z *= 1 + rng.range(-j, j);
    }
    out.push({
      px: p.origin.x, py: p.origin.y, pz: p.origin.z,
      vx: v.x, vy: v.y, vz: v.z,
      vol: DROPLET_VOLUME,
      scale: sputter ? SPUTTER_SCALE : DROPLET_SCALE,
    });
  }
  return out;
}
