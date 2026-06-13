import type { Container, Rect, Vec3 } from './types';
import { DropletPool } from './pool';
import {
  GRAVITY, LAUNCH_SPEED_MIN, LAUNCH_SPEED_MAX, LAUNCH_PITCH_DEG,
} from '../tuning';

export interface IntegrateResult {
  capturedVolume: number;
  spilledVolume: number; // floor + overflow (hazard hits set hazardHit instead — the level fails, so their volume is not accounted)
  hazardHit: boolean;
}

const DEG = Math.PI / 180;

/** Initial velocity for a shot at the given pressure and aim yaw. */
export function launchVelocity(pressure: number, yaw: number): Vec3 {
  const speed = LAUNCH_SPEED_MIN + (LAUNCH_SPEED_MAX - LAUNCH_SPEED_MIN) * pressure;
  const pitch = LAUNCH_PITCH_DEG * DEG;
  const horiz = Math.cos(pitch) * speed;
  return { x: Math.sin(yaw) * horiz, y: Math.sin(pitch) * speed, z: Math.cos(yaw) * horiz };
}

/** Collision-free trace to the floor — used for tuning + aim assist. */
export function predictLanding(pressure: number, yaw: number, origin: Vec3): Vec3 {
  const v = launchVelocity(pressure, yaw);
  let { x, y, z } = origin;
  const dt = 1 / 240;
  for (let i = 0; i < 4000 && y > 0; i++) {
    v.y -= GRAVITY * dt;
    x += v.x * dt; y += v.y * dt; z += v.z * dt;
  }
  return { x, y: 0, z };
}

function inRect(x: number, z: number, r: Rect): boolean {
  return x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1;
}

// Advances every alive droplet by exactly `dt` (one semi-implicit Euler step), so it
// composes with the rest of the sim (pressure/emission/movers) which also advance by dt.
// Tunnelling isn't a concern: capture/floor use plane-crossing tests (py0 vs new py),
// catching a droplet even if it skips far past the boundary within a single step.
export function integrate(pool: DropletPool, containers: Container[], hazards: Rect[], dt: number): IntegrateResult {
  let capturedVolume = 0;
  let spilledVolume = 0;
  let hazardHit = false;

  const drops = pool.droplets;
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    if (!d.alive) continue;

    const py0 = d.py;
    d.vy -= GRAVITY * dt;
    d.px += d.vx * dt; d.py += d.vy * dt; d.pz += d.vz * dt;

    // Capture: crossed a rim plane downward, inside the rim radius.
    let consumed = false;
    for (let c = 0; c < containers.length; c++) {
      const con = containers[c];
      if (py0 > con.rimHeight && d.py <= con.rimHeight) {
        const t = (py0 - con.rimHeight) / (py0 - d.py); // 0..1 along this step
        const cx = d.px - d.vx * dt * (1 - t);
        const cz = d.pz - d.vz * dt * (1 - t);
        const dx = cx - con.px, dz = cz - con.pz;
        if (dx * dx + dz * dz <= con.rimRadius * con.rimRadius) {
          const room = Math.max(0, con.capacity - con.fill);
          const taken = Math.min(d.vol, room);
          con.fill += taken;
          capturedVolume += taken;
          spilledVolume += d.vol - taken; // overflow
          pool.kill(i);
          consumed = true;
          break;
        }
      }
    }
    if (consumed) continue;

    // Floor.
    if (d.py <= 0) {
      const t = py0 <= 0 ? 0 : py0 / (py0 - d.py);
      const fx = d.px - d.vx * dt * (1 - t);
      const fz = d.pz - d.vz * dt * (1 - t);
      let onHazard = false;
      for (let h = 0; h < hazards.length; h++) if (inRect(fx, fz, hazards[h])) { onHazard = true; break; }
      if (onHazard) hazardHit = true; else spilledVolume += d.vol;
      pool.kill(i);
    }
  }

  return { capturedVolume, spilledVolume, hazardHit };
}
