# Whizzard — Game Design

- **Status:** Draft — brainstormed and approved in-session, 2026-06-12
- **Date:** 2026-06-12
- **Owner:** Jerry Walters
- **Route:** `jerrydwalters.com/whizzard/` (built tier, `projects/whizzard/`)

---

## 1. Overview & goals

**Whizzard** is a first-person absurd-realism aiming game in the QWOP /
"Getting Over It" family of deliberately-awkward physical comedy games. You
stand at a fixed spot in a tiled room, a censor-blurred rectangle at the
bottom of your screen. You charge bladder pressure, release, and try to land
the resulting stream in containers (a toilet, a cup, a boot…) scattered at
varying depths. Captured volume scores; floor spill wastes; certain surfaces
must never be hit.

Goals:

- Prove the core mechanic is funny **and** has a real skill curve.
- Ship as the second built-tier project on the hub, validating the
  `projects/<name>/` pipeline for a three.js game.
- All assets placeholder/procedural — no art dependencies. If the mechanic
  sticks, it graduates per the hub's Godot path.

## 2. Player-facing design

### 2.1 Camera & controls

- **First-person**, fixed position, eye height ~1.6 m, pitched down ~50°
  (tunable constant). The room, containers, and most of the stream arc are
  in frame; the player never moves, only aims.
- **Aim:** yaw rotation, clamped ±35°. Keyboard `←`/`→` or `A`/`D`;
  mouse/touch horizontal drag. Aiming works at all times, including
  mid-stream.
- **Pressure:** hold `Space` / mouse button / touch to charge; release to
  open the flow. Press again while flowing to clench.

### 2.2 Pressure model — commit-and-decay

The defining mechanic. One bladder per level.

- **Charge:** pressure builds 0→100% over ~1.8 s of holding. No flow while
  charging.
- **Release:** flow opens at the charged pressure. Launch speed scales with
  current pressure, so pressure ≈ landing depth.
- **Decay:** while flowing, pressure drains continuously — the landing point
  visibly "walks back" toward the player. Sweeping that droop across
  containers is the core skill.
- **Clench:** pressing during flow cuts it over ~150 ms. The airborne tail
  still lands wherever it was headed. The clench itself costs a small
  dribble spawned at the player's feet (pure waste). After a clench the
  player may re-charge and flow again until the bladder is empty.
- **Bladder:** drains in proportion to emitted volume. Empty bladder +
  no airborne droplets → level resolves.

### 2.3 Chaos modifiers (all in prototype)

| Modifier | Trigger | Effect |
|---|---|---|
| High-pressure wobble | pressure > ~80% | aim noise ramps up with pressure; ± a few degrees of wander at 100% |
| Low-pressure sputter | pressure < ~20% | emission turns sparse and randomized — scattered droplets, inherently messy tail |
| Can't-hold-it | held at > 95% for ~1.5 s | involuntary full-pressure release with amplified "panic wobble" for the first second |

Deliberately excluded from v1: drunk aim inertia, oscillating-fan stream
deflection (see §9).

### 2.4 Scoring

- **Pass:** capture ≥ 40% of total bladder volume into containers.
- **Stars:** ★ 40% · ★★ 65% · ★★★ 85%.
- Floor spill is pure waste (no penalty beyond lost volume). Overfilling a
  container overflows — further droplets spill off the rim and are wasted.
- **Hazard zones** (e.g. the rug) fail the level instantly on a single hit.
- Results screen: captured % vs spilled %, stars, retry / next.

### 2.5 Levels

Data-driven; one TS config describes containers (type, position, rim radius,
rim height, capacity), hazard rects, mover paths, bladder volume, and star
thresholds.

| # | Name | Setup | Teaches |
|---|---|---|---|
| 1 | Porcelain 101 | big toilet, close, dead ahead | charge/release basics |
| 2 | World's Best Cup | small cup, mid-range, off-center | aim + pressure together |
| 3 | Das Boot | boot at near-max range | full charge + wobble risk |
| 4 | Droop Sweep | three cups staggered in depth | riding the decay across targets |
| 5 | The Persian Rug | cup beyond a no-pee rug | clench timing, sputter terror |
| 6 | Roomba Finale | cup patrolling on a roomba | leading a moving target |

Level intro cards get one line of wizard-flavored flavor text (the name is
Whizzard; lean in lightly).

## 3. Architecture

Standalone Vite + TypeScript app at `projects/whizzard/`, following the
`dodge` pattern: own `package.json`, `base: '/whizzard/'`, `meta.json`
(title "Whizzard", blurb) for the hub's projects index. Vanilla **three.js**
(no react-three-fiber — the sim is an imperative fixed-timestep loop; the
hub site's React stack buys nothing here). HUD is a plain DOM overlay.

```
projects/whizzard/
  index.html            # canvas + HUD overlay roots
  meta.json
  vite.config.ts        # base: '/whizzard/'
  src/
    main.ts             # bootstrap, level select wiring
    game.ts             # state machine + fixed-timestep loop
    input.ts            # keyboard/mouse/touch → {aimDelta, holdDown} intents
    levels.ts           # level data (containers, hazards, movers, thresholds)
    sim/
      pressure.ts       # charge/decay/clench/overcharge model (pure)
      stream.ts         # emitter: pressure+aim → spawned droplets (pure-ish, seeded RNG)
      ballistics.ts     # droplet integration + capture/floor/hazard tests (pure)
    scene/
      room.ts           # floor, walls, grid texture, lighting
      containers.ts     # procedural toilet/cup/boot/roomba meshes + fill surfaces
      stream-view.ts    # InstancedMesh droplet rendering, puddle decals
      camera.ts         # rig + yaw control
    hud/
      hud.ts            # bladder meter, pressure bar, censor div, cards, results
```

**State machine:** `LEVEL_INTRO → IDLE ⇄ CHARGING → FLOWING → (clench →
IDLE) → RESOLVING → RESULTS`, plus `FAILED` (hazard hit) short-circuit.
States track flow/charge status only — yaw aiming is orthogonal and active
in every state. `RESOLVING` waits for airborne droplets to land after the
bladder empties.

**Seams:** `sim/` is pure functions over plain data (no three.js imports) —
unit-testable and deterministic under a seeded RNG. `scene/` and `hud/` are
render-only consumers of sim state. `input.ts` produces intents, never
touches the sim directly.

## 4. Simulation

### 4.1 Liquid = one particle system

All liquid is a single pooled droplet array rendered via one
`THREE.InstancedMesh` (small spheres, amber, slight emissive). Cap ~1,500
alive. The same emitter produces every regime:

- **Stream:** ~120 droplets/s at high pressure → reads as a continuous rope.
- **Droop:** emission speed = f(current pressure); decay does the rest.
- **Sputter:** < 20% pressure → rate drops to ~15–30/s, per-droplet velocity
  jittered ±15%, larger droplet scale.
- **Clench tail:** already-airborne droplets keep flying; nothing special.
- **Dribble:** clench spawns a few near-zero-velocity droplets at the feet.

### 4.2 Integration & collision

- Fixed timestep (120 Hz sim, rendered at display rate; dt clamped on tab
  refocus). Semi-implicit Euler; gravity 9.81; no drag in v1.
- **Capture:** when a droplet crosses a container's rim plane (y falls
  through `rimHeight`) and its XZ is inside the rim radius → captured.
  Container fill += droplet volume; droplet recycled into the pool.
  At capacity, the rim test instead spawns an overflow spill (wasted).
- **Floor:** y ≤ 0 → recycled; the nearest puddle decal grows (or a new one
  spawns). Puddles are flat circles that merge visually by overlap.
- **Hazard:** floor hit inside a hazard rect → `FAILED`, immediately.
- **Movers (roomba):** container transform animated along a path; capture
  math reads its current world position — otherwise unchanged. Hits on the
  mover's body (outside the cup rim) count as floor waste, not capture.

### 4.3 Tuning constants (initial values, all in one `tuning.ts`)

| Constant | Initial | Note |
|---|---|---|
| `CHARGE_TIME` | 1.8 s | 0→100% |
| `OVERCHARGE_FUSE` | 1.5 s | time at >95% before involuntary release |
| `FLOW_PRESSURE_DECAY` | ~12%/s | droop rate while flowing |
| `WOBBLE_START` | 80% | noise amplitude ramps above this |
| `SPUTTER_START` | 20% | sparse-droplet regime below this |
| `CLENCH_TIME` | 150 ms | flow cutoff duration |
| `CLENCH_DRIBBLE` | ~1% bladder | spawned at feet per clench |
| `EMIT_RATE_MAX` | 120 /s | full-pressure emission |
| `LAUNCH_SPEED` | min 2 / max 8 m/s | maps pressure → distance; tuned so 100% ≈ 6 m depth |
| `LAUNCH_PITCH` | ~35° above horizontal | fixed; player controls yaw only — depth comes from pressure |
| `AIM_YAW_CLAMP` | ±35° | |
| `PARTICLE_CAP` | 1500 | pooled |

Feel tuning is expected to revise all of these during playtest.

## 5. HUD & presentation

DOM overlay, plain TS + CSS (no framework):

- **Bladder meter:** small bladder-shaped SVG, fill drains proportionally.
- **Pressure bar:** vertical gauge; red zone above 95% with a pulsing
  "can't hold it" warning during the overcharge fuse.
- **Censor blur:** a fixed DOM div over the bottom-center of the canvas with
  `backdrop-filter: blur(14px)` (+ slight saturate). It censors whatever is
  behind it — the joke renders itself. A tiny procedural "nozzle" mesh sits
  in-scene behind it so there is genuinely something to censor.
- **Cards:** level intro (name, flavor line, target %), results (captured /
  spilled split bar, stars, retry/next), fail card for hazards.
- **Level select:** simple grid with star records, persisted to
  `localStorage` (`whizzard.progress.v1`).

Theme: game has its own dark look (consistent with `dodge`); it does not
follow the hub's light/dark toggle.

## 6. Placeholder assets

Everything procedural, in code — no binary assets in v1:

- **Containers:** cup = open cylinder; boot = two boxes + cylinder shaft;
  toilet = cylinder bowl + box tank; roomba = low flat cylinder (animated).
- **Room:** plane floor with generated grid/tile texture (CanvasTexture),
  back/side walls, two directional lights + ambient.
- **Liquid:** instanced spheres; container fill = amber disc rising inside
  the container; puddles = flat dark-amber circles.
- **Player:** small box "nozzle" mesh at the bottom of frame (behind the
  censor div), yaws with aim so the censored thing visibly points.

## 7. Performance & resilience

- Particle pool, zero allocation in the hot loop; single InstancedMesh draw
  call for all droplets.
- `document.visibilitychange` → pause; dt clamp prevents tunneling after
  long frames. Capture test is plane-crossing based (checks the segment
  between prev/next y), so droplets can't skip through rims at high speed.
- Mobile: touch drag aims, touch-and-hold charges; layout fits portrait.
  DPR capped at 2.
- WebGL unavailable → friendly fallback message in the HUD root.

## 8. Testing

- **Vitest** on `sim/` (pure, seeded): pressure model state transitions
  (charge curve, decay, clench, overcharge fuse), ballistic landing-distance
  for given pressures, capture/overflow/hazard logic, bladder accounting
  (captured + spilled + remaining ≈ total).
- Scene/HUD verified by playtest via `pnpm dev` in `projects/whizzard/` and
  `pnpm preview` at the hub root (per CLAUDE.md, check both themes for the
  hub card; the game itself is theme-fixed).

## 9. Out of scope (v2 candidates)

- Oscillating-fan stream deflection; drunk-aim inertia ("drunk mode").
- Sound (procedural WebAudio trickle/splash — high comedy value, do early
  in v2).
- Side-view camera option, real GLB art, leaderboards (KV), more levels
  (urinal cake target, moving train bathroom, wind = outdoor levels).
- **Persistent room direction:** longer-term, the fixed room could become a
  real explorable space you return to between levels (a bathroom/hub you
  decorate, walk around, pick targets in) rather than a flat backdrop. v1's
  scene is built as a real 3D room (floor, walls, lights) partly to keep that
  door open — the camera rig and container placement are world-space, so
  "stand somewhere else and look around" is an additive change, not a rewrite.

---

## Decision log

| Decision | Choice | Rejected alternatives |
|---|---|---|
| Session structure | level-based challenges | sandbox score attack; endless arcade |
| Stream model | commit-and-decay with clench | discrete burst shots; hose mode |
| Chaos modifiers | wobble + sputter + overcharge | drunk inertia (v2), fan (v2) |
| Camera | first-person looking down | third-person side view |
| Scoring | capture % + stars (40/65/85) | fill-to-brim binary; points economy |
| Stack | vanilla three.js + instanced particles | r3f wrapper; tube-mesh stream |
| Name | Whizzard | Flow State, Number One, Streamer, Whizz Kid, Streamline, Golden Arc, Urine Trouble |
