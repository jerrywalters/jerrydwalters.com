import * as THREE from 'three';
import type { Container, PressureInput, PressureState, Vec3 } from './sim/types';
import { DropletPool } from './sim/pool';
import { makeRng, type Rng } from './sim/rng';
import { initialPressure, stepPressure, isFlowing } from './sim/pressure';
import { integrate, predictArc } from './sim/ballistics';
import { emit, initialEmit, type EmitState } from './sim/stream';
import { CameraRig } from './scene/camera';
import { ContainerViews } from './scene/containers';
import { StreamView } from './scene/stream-view';
import { TrajectoryView } from './scene/trajectory';
import { Input, type Intents } from './input';
import { Hud } from './hud/hud';
import type { Level } from './levels';
import {
  AIM_YAW_CLAMP_DEG, AIM_YAW_SPEED_DEG, SIM_HZ, MAX_FRAME_DT, PARTICLE_CAP,
  PANIC_TIME, CLENCH_DRIBBLE_DROPS, NOZZLE_HEIGHT, NOZZLE_FORWARD, OVERCHARGE_THRESHOLD,
} from './tuning';

export type GamePhase = 'menu' | 'intro' | 'playing' | 'resolving' | 'results' | 'failed';

interface GameDeps {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  rig: CameraRig;
  stream: StreamView;
  nozzle: THREE.Object3D;
  input: Input;
  hud: Hud;
}

const DEG = Math.PI / 180;
const CLAMP = AIM_YAW_CLAMP_DEG * DEG;
const YAW_SPEED = AIM_YAW_SPEED_DEG * DEG;
const NEUTRAL: PressureInput = { pressed: false, released: false, held: false };

/** Owns the per-level sim state and runs the fixed-timestep loop + state machine. */
export class Game {
  private readonly d: GameDeps;
  private readonly pool = new DropletPool(PARTICLE_CAP);
  private readonly trajectory = new TrajectoryView();
  private readonly proj = new THREE.Vector3(); // reused for nozzle→screen projection
  private emitState: EmitState = initialEmit();
  private rng: Rng = makeRng(1);

  phase: GamePhase = 'menu';
  private level: Level | null = null;
  private containers: Container[] = []; // working copies (fill mutates; resets per load)

  private pressure: PressureState = initialPressure();
  private yaw = 0;
  private time = 0; // sim seconds since level load (drives movers)
  private acc = 0;  // fixed-timestep accumulator

  private bladder = 0;
  private captured = 0;
  private spilled = 0;
  private hazardVolume = 0; // accumulated volume landed on hazards this level

  // Edges carried across frames where no fixed sub-step ran (so a press/release is never lost).
  private pendingPressed = false;
  private pendingReleased = false;

  constructor(deps: GameDeps) {
    this.d = deps;
    this.d.scene.add(this.d.stream.group);
    this.d.scene.add(this.trajectory.group);
  }

  /** The stream/preview origin: the nozzle tip, orbited by the current aim yaw. */
  private nozzleOrigin(): Vec3 {
    return {
      x: Math.sin(this.yaw) * NOZZLE_FORWARD,
      y: NOZZLE_HEIGHT,
      z: Math.cos(this.yaw) * NOZZLE_FORWARD,
    };
  }

  /** Build a level's scene + reset all sim state, then show its intro card. */
  loadLevel(level: Level) {
    this.level = level;
    this.containers = level.containers.map((c) => ({ ...c, fill: 0 }));

    this.bladder = level.bladder;
    this.captured = 0;
    this.spilled = 0;
    this.hazardVolume = 0;
    this.time = 0;
    this.acc = 0;
    this.yaw = 0;
    this.pressure = initialPressure();
    this.emitState = initialEmit();
    this.rng = makeRng(level.id * 1000 + 7);
    this.pendingPressed = this.pendingReleased = false;

    for (let i = 0; i < this.pool.droplets.length; i++) this.pool.kill(i);
    this.d.stream.clearPuddles();
    this.d.stream.sync(this.pool);

    this.setContainerViews(new ContainerViews(level));
    this.d.rig.setYaw(0);
    this.d.nozzle.rotation.y = 0;
    this.trajectory.setVisible(false);

    this.phase = 'intro';
    this.d.hud.showIntro(level.name, level.flavor, level.stars[0]);
  }

  /** Leave the intro and begin play. */
  start() {
    this.phase = 'playing';
    this.d.hud.hideOverlays();
  }

  private views: ContainerViews | null = null;
  private setContainerViews(next: ContainerViews) {
    if (this.views) {
      this.d.scene.remove(this.views.group);
      this.views.dispose();
    }
    this.views = next;
    this.d.scene.add(next.group);
  }

  /** Drive the sim with real elapsed seconds, then render. */
  frame(dtReal: number) {
    if (this.phase === 'playing' || this.phase === 'resolving') {
      const intents = this.d.input.read();
      this.pendingPressed = this.pendingPressed || intents.pressed;
      this.pendingReleased = this.pendingReleased || intents.released;

      this.acc += Math.min(dtReal, MAX_FRAME_DT);
      const step = 1 / SIM_HZ;
      let first = true;
      while (this.acc >= step && (this.phase === 'playing' || this.phase === 'resolving')) {
        const edge: PressureInput = first
          ? { pressed: this.pendingPressed, released: this.pendingReleased, held: intents.held }
          : { ...NEUTRAL, held: intents.held };
        this.tick(step, edge, intents);
        if (first) {
          this.pendingPressed = false;
          this.pendingReleased = false;
          first = false;
        }
        this.acc -= step;
      }

      this.views?.syncFill(this.containers);
      this.d.stream.sync(this.pool);
      if (this.level) {
        this.d.hud.setBladder(this.bladder / this.level.bladder);
        const overcharge =
          (this.pressure.phase === 'charging' && this.pressure.pressure >= OVERCHARGE_THRESHOLD) ||
          this.pressure.panicTimer > 0;
        this.d.hud.setPressure(this.pressure.pressure, overcharge);
      }
      this.updateAimPreview();
      this.updateCensor();
    }

    this.d.renderer.render(this.d.scene, this.d.rig.camera);
  }

  /** Show the predicted arc + landing ring while aiming/charging (hidden once flowing). */
  private updateAimPreview() {
    const show = this.phase === 'playing' && (this.pressure.phase === 'idle' || this.pressure.phase === 'charging');
    this.trajectory.setVisible(show);
    if (show) this.trajectory.update(predictArc(this.pressure.pressure, this.yaw, this.nozzleOrigin()));
  }

  /** Keep the censor blur over the nozzle wherever it lands on screen as the aim yaws. */
  private updateCensor() {
    const o = this.nozzleOrigin();
    this.proj.set(o.x, o.y + 0.22, o.z).project(this.d.rig.camera); // tip a touch above the origin
    const sx = (this.proj.x * 0.5 + 0.5) * window.innerWidth;
    const sy = (-this.proj.y * 0.5 + 0.5) * window.innerHeight;
    const w = 210;
    const top = Math.max(0, sy - 46);
    this.d.hud.setCensor(sx - w / 2, top, w, window.innerHeight - top);
  }

  private tick(dt: number, edge: PressureInput, intents: Intents) {
    const level = this.level;
    if (!level) return;

    // 1. Aim (yaw only). Pointer is absolute; keys are relative.
    if (intents.aimAbsolute !== null) {
      this.yaw = intents.aimAbsolute * CLAMP;
    } else if (intents.aimDir !== 0) {
      this.yaw += intents.aimDir * YAW_SPEED * dt;
    }
    this.yaw = Math.max(-CLAMP, Math.min(CLAMP, this.yaw));
    this.d.rig.setYaw(this.yaw);
    this.d.nozzle.rotation.y = this.yaw;

    // 2. Pressure model.
    const prev = this.pressure;
    this.pressure = stepPressure(prev, edge, dt);
    if (prev.phase === 'flowing' && this.pressure.phase === 'clenching') {
      this.spawnDribble();
    }

    // 3. Movers.
    this.time += dt;
    this.views?.update(this.containers, level.movers, this.time);

    // 4. Emission.
    if (isFlowing(this.pressure) && this.bladder > 0) {
      const origin = this.nozzleOrigin();
      const panic = Math.max(0, Math.min(1, this.pressure.panicTimer / PANIC_TIME));
      const seeds = emit({ pressure: this.pressure.pressure, panic, yaw: this.yaw, origin, dt }, this.rng, this.emitState);
      for (const s of seeds) {
        if (this.bladder <= 0) break;
        this.bladder -= s.vol;
        this.pool.spawn(s);
      }
    }

    // 5. Integrate + collisions (grow puddles where droplets spill on the floor).
    const r = integrate(this.pool, this.containers, level.hazards, dt, (x, z, vol) => this.d.stream.addPuddle(x, z, vol));
    this.captured += r.capturedVolume;
    this.spilled += r.spilledVolume;
    this.hazardVolume += r.hazardVolume;
    // Fail only once too much has hit the hazard — a single stray drop shouldn't end the run.
    if (this.hazardVolume > (level.hazardTolerance ?? 0) * level.bladder) {
      this.enterFailed();
      return;
    }

    // 6. Transitions.
    if (this.phase === 'playing' && this.bladder <= 0 && this.pressure.phase === 'idle') {
      this.phase = 'resolving';
    }
    if (this.phase === 'resolving' && this.pool.aliveCount === 0) {
      this.finish();
    }
  }

  private spawnDribble() {
    const n = Math.min(CLENCH_DRIBBLE_DROPS, Math.max(0, this.bladder));
    for (let i = 0; i < n; i++) {
      if (this.bladder <= 0) break;
      this.bladder -= 1;
      this.pool.spawn({
        px: this.rng.range(-0.08, 0.08),
        py: 0.18,
        pz: NOZZLE_FORWARD + this.rng.range(-0.05, 0.05),
        vx: this.rng.range(-0.3, 0.3),
        vy: -0.2,
        vz: this.rng.range(0, 0.4),
        vol: 1,
        scale: 1.2,
      });
    }
  }

  private finish() {
    const level = this.level!;
    // Score stars against what's actually catchable — min(bladder, total capacity) — so the
    // thresholds stay reachable no matter how bladder/capacity are tuned. (Scoring against
    // bladder alone makes ★★/★★★ impossible whenever the containers hold less than the
    // bladder, which is most levels.) The displayed bar stays in bladder terms, so
    // captured% + spilled% = 100% of the bladder you actually used.
    const capacity = level.containers.reduce((s, con) => s + con.capacity, 0);
    const catchable = Math.max(1, Math.min(level.bladder, capacity));
    const starPct = this.captured / catchable;
    const [a, b, c] = level.stars;
    const starCount = starPct >= c ? 3 : starPct >= b ? 2 : starPct >= a ? 1 : 0;
    this.phase = 'results';
    this.trajectory.setVisible(false);
    this.d.hud.showResults(this.captured / level.bladder, this.spilled / level.bladder, starCount);
    this.onComplete?.(level.id, starCount);
  }

  private enterFailed() {
    this.phase = 'failed';
    this.trajectory.setVisible(false);
    this.d.hud.showFail('Too much hit the rug. The whizzard has shamed the order.');
  }

  /** Set by the bootstrap to persist results (kept out of the HUD so the loop stays pure). */
  onComplete?: (levelId: number, stars: number) => void;
}
