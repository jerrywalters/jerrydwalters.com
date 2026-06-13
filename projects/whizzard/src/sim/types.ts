/** Plain vector — the sim never imports three.js. Scene code maps these to THREE.Vector3. */
export interface Vec3 { x: number; y: number; z: number }

/** One pooled droplet. Mutated in place; `alive=false` means it's free. */
export interface Droplet {
  alive: boolean;
  px: number; py: number; pz: number;
  vx: number; vy: number; vz: number;
  vol: number;   // volume units (sums to bladder accounting)
  scale: number; // visual radius multiplier
}

/** A request to spawn one droplet, produced by the emitter. */
export interface DropletSeed {
  px: number; py: number; pz: number;
  vx: number; vy: number; vz: number;
  vol: number;
  scale: number;
}

export type ContainerKind = 'cup' | 'boot' | 'toilet' | 'roomba-cup';

/** A target. For movers, `px/pz` are updated each frame before integrate(). */
export interface Container {
  id: string;
  kind: ContainerKind;
  px: number; py: number; pz: number; // base/world position (py is its footprint y)
  rimRadius: number;                  // capture radius in XZ
  rimHeight: number;                  // world y of the opening plane
  capacity: number;                   // total volume it holds
  fill: number;                       // current captured volume (mutated)
}

/** Axis-aligned floor region in XZ (e.g. a hazard rug). */
export interface Rect { x0: number; z0: number; x1: number; z1: number }

export type PressurePhase = 'idle' | 'charging' | 'flowing' | 'clenching';

export interface PressureState {
  phase: PressurePhase;
  pressure: number;       // 0..1
  overchargeTimer: number; // seconds spent above the overcharge threshold while charging
  clenchTimer: number;     // seconds into a clench
  clenchFrom: number;      // pressure at the moment the clench started
  panicTimer: number;      // seconds of panic-wobble remaining (set when overcharge fires)
}

/** Edge-detected button state for one tick. */
export interface PressureInput {
  pressed: boolean;   // button went down this tick
  released: boolean;  // button went up this tick
  held: boolean;      // button currently down
}
