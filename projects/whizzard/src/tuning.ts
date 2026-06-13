// All feel constants in one place. Expect heavy revision during playtest.
// LAUNCH_SPEED_MAX is set so a full-charge shot at LAUNCH_PITCH from NOZZLE_HEIGHT
// lands ~6 m out: R = (v·cosθ/g)·(v·sinθ + √((v·sinθ)² + 2·g·h)).
// v=7, θ=35°, h=1.0, g=9.81 → R ≈ 5.8 m. (See ballistics.predictLanding test.)

export const GRAVITY = 9.81;

export const NOZZLE_HEIGHT = 1.0;     // m, where the stream originates
export const NOZZLE_FORWARD = 0.25;   // m, how far ahead of origin the nozzle sits
export const EYE_HEIGHT = 1.6;        // m, camera height

export const CHARGE_TIME = 1.8;       // s to go 0 → 1
export const FLOW_PRESSURE_DECAY = 0.12; // pressure/s lost while flowing (the "droop")
export const OVERCHARGE_THRESHOLD = 0.95;
export const OVERCHARGE_FUSE = 1.5;   // s held above threshold → involuntary release
export const PANIC_TIME = 1.0;        // s of amplified wobble after an involuntary release
export const CLENCH_TIME = 0.15;      // s to cut the flow to zero

export const WOBBLE_START = 0.8;      // pressure above which aim noise ramps in
export const WOBBLE_MAX_DEG = 4;      // max yaw wander (deg) at full pressure
export const PANIC_WOBBLE_DEG = 7;    // extra yaw wander (deg) during panic

export const SPUTTER_START = 0.2;     // pressure below which the stream breaks up
export const SPUTTER_JITTER = 0.15;   // ± velocity jitter fraction in sputter regime

export const EMIT_RATE_MAX = 120;     // droplets/s at full pressure
export const EMIT_RATE_SPUTTER = 22;  // droplets/s in the sputter regime
export const DROPLET_VOLUME = 1;      // volume per droplet (bladder is in these units)
export const DROPLET_SCALE = 1;       // base visual scale
export const SPUTTER_SCALE = 1.6;     // fatter droplets when sputtering

export const LAUNCH_SPEED_MIN = 2.5;  // m/s at pressure 0
export const LAUNCH_SPEED_MAX = 7.0;  // m/s at pressure 1
export const LAUNCH_PITCH_DEG = 35;   // fixed elevation; player controls yaw only

export const AIM_YAW_CLAMP_DEG = 35;  // ± aim limit
export const AIM_YAW_SPEED_DEG = 60;  // deg/s for keyboard aim

export const CLENCH_DRIBBLE_DROPS = 6; // wasted droplets spawned at the feet per clench

export const PARTICLE_CAP = 1500;
export const SIM_HZ = 120;            // fixed timestep frequency
export const MAX_FRAME_DT = 0.1;      // clamp dt after tab refocus / long frames

// Star thresholds are per-level (levels.ts); pass = first threshold.
