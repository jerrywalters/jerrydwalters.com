# jerrydwalters.com — Personal App / Game Hub

- **Status:** Revision 2 — reviewed (cold-context Fable review, 2026-06-11) and updated
- **Date:** 2026-06-11
- **Owner:** Jerry Walters (`jerrydwalters@gmail.com`, GitHub `jerrywalters`)
- **Repo:** `jerrywalters/jerrydwalters.com` (public). The old site lives on as
  `jerrywalters/jerrydwalters.com-legacy` — kept, never deployed again.
- **Domain decision:** keep `jerrydwalters.com`; after DNS cutover, transfer the
  registration DreamHost → Cloudflare Registrar so registrar + DNS + hosting + data all
  live in one Cloudflare account (`jerrydwalters@gmail.com`).

---

## 1. Overview & goals

`jerrydwalters.com` is being wiped and rebuilt from scratch. It is not "a website" —
it is an **umbrella hub** that serves three roles:

1. **Minimal portfolio landing** at the root — name, contact info, and a small "cryptic
   goofy" 3D rendering.
2. **A host for little self-built apps** — reached at `jerrydwalters.com/<project>` (and
   promotable to `<project>.jerrydwalters.com` later). Some are static; some need saved
   data; some are personal apps with login (e.g. a guitar-practice tracker).
3. **A sandbox for browser game prototypes** — built quickly (often with Claude) to test
   whether an idea is fun, with a clean path to graduate the good ones into **Godot**.

### Guiding principle

Optimize for **near-zero-friction "spin up a new thing, push, it's live."** The umbrella
must never impose a stack on an individual project — each project picks the tool that fits
it. Every project, regardless of engine, reduces to *"a folder of files served at a path."*

---

## 2. Architecture

> Review note: revision 1 targeted Cloudflare **Pages**. Cloudflare now recommends
> **Workers with static assets** for new projects (Pages is in maintenance posture; its
> docs link a "Migrate to Workers" guide). Same free static serving and git deploys, plus
> capabilities Pages never had (Cron Triggers, Durable Objects, the Cloudflare Vite
> plugin). This spec targets Workers from day one so nothing needs migrating later.

- **One Git repo → one Cloudflare Worker** with a static-assets binding.
  - Static files served free from the edge; the worker script runs **only** for
    `/api/*` routes (`assets.run_worker_first = ["/api/*"]`).
  - **Workers Builds** connects the GitHub repo: push to `main` → build → deploy.
  - **Preview URLs** for non-production branches (`<branch>-<worker>.<account>.workers.dev`),
    posted on PRs. Caveats, accepted for a personal hub: previews live on `workers.dev`
    only, and **previews share production bindings** (a preview branch writes to prod
    KV/D1 — fine at this scale; revisit with Wrangler Environments if it ever bites).
- **DNS on Cloudflare** (moved from Netlify; §9). Mandatory, not just convenient: Workers
  custom domains require the zone's nameservers to be on Cloudflare. **Subpaths now**
  (`/project`); **wildcard subdomains** promotable later with no migration.
- **One platform spans static → dynamic**, so a project can grow capability without
  changing hosts:
  - Worker routes at `/api/*` (single entry, e.g. Hono router)
  - **D1** — serverless SQLite, for relational app data (the guitar tracker)
  - **KV** — key/value, for simple save data / high scores
  - **R2** — object storage, available if a project ever needs file storage (not
    provisioned up front)
  - **Cloudflare Access** (Zero Trust) — auth for personal apps, *no auth code*
- **Provision bindings lazily.** No D1/KV/R2 is created until the first project in that
  tier exists. Day-one config is just the assets directory.

```
                         ┌──────────────────────────────────┐
   push to GitHub  ──▶   │  Workers Builds (build & deploy)  │
                         │  - Astro umbrella → static        │
                         │  - public/<name> passthrough      │
                         │  - projects/<name> Vite builds    │
                         │  - worker/ → /api/* (Hono)        │
                         └────────────────┬─────────────────┘
                                          │ bindings (created when first needed)
                          ┌───────────────┼────────────────┐
                          ▼               ▼                ▼
                       D1 (SQL)        KV (saves)       R2 (files, future)
                          ▲
               Cloudflare Access gates personal apps (Google/GitHub identity)
```

---

## 3. The umbrella (root site)

- **Stack: Astro + React islands.**
  - Astro ships **zero JS by default**; interactive bits are React components mounted as
    islands (`<Scene client:load />`). The landing stays feather-light.
  - The **cryptic 3D doodle** is a **react-three-fiber** island on the landing page.
  - An **auto-generated `/projects` index** (rule in §8) lists the hub as it grows.
- **No Cloudflare adapter.** A fully pre-rendered Astro site deploys as static assets with
  no adapter and no worker code. `@astrojs/cloudflare` is only needed if a page ever moves
  to SSR — and the hand-written `/api` worker coexists fine with adapterless static Astro,
  so don't install it "because there's a worker."
- React is used exactly where it earns its weight (3D, interactive widgets), not site-wide.
- *Rejected alternative:* a pure Vite + React SPA umbrella — simpler "all React" mental
  model, but ships more JS for a minimal landing and requires hand-maintaining the index.

---

## 4. Project model — two ways to add a project

| Tier | Where it lives | Becomes live at | When to use |
|------|----------------|-----------------|-------------|
| **No-build** | `public/<name>/` (index.html + JS, CDN scripts) | `/<name>` | Most prototypes. Drop a folder, push, done. Maximum velocity. |
| **Built** | `projects/<name>/` (Vite app, `base: '/<name>/'`) | `/<name>` | Needs bundling / TypeScript / npm deps. Root build script assembles output into the deploy dir. |

The no-build path is the default and the common case. The built path is an opt-in upgrade
for a single project; it does not change anything about the others.

### Growth path (decided: no submodules)

Projects are **plain directories in the monorepo** — no git submodules or subrepos.
Submodules add pinned-SHA double-commits, clone/CI friction, and ceremony that fights the
velocity goal. When a project outgrows the hub, **promote it**: extract it to its own repo
(`git subtree split` preserves its history), give it its own Worker, and serve it at
`<project>.jerrydwalters.com` — the wildcard-subdomain design already supports this with
no migration of the hub itself. Nothing is lost by starting in the monorepo.

### Routing note

Workers' SPA fallback (`not_found_handling`) is a single global setting — it can't give
one subpath its own SPA fallback. Prototypes with their own `index.html` (this spec's
model) are unaffected; a future client-side-routed app under a subpath needs `_redirects`
rules or worker logic, not a config flag.

---

## 5. Capability tiers (a project picks one)

1. **Static** — pure front end (games, doodles). Default.
2. **+ Simple persistence** — high scores / "save my run": a worker route + **KV**,
   keyed by an anonymous device id. No login.
   - Convention: one shared KV namespace; keys prefixed `<project>:` to keep projects
     from colliding.
3. **+ Full personal app** — e.g. guitar-practice tracker: worker routes + **D1**,
   gated by **Cloudflare Access** so only Jerry's Google/GitHub identity can log in.
   Zero auth code, zero auth UI.
   - Convention: each personal app gets **its own D1 database**.
   - *Upgrade path:* if a specific app ever needs public multi-user accounts, swap Access
     for a Workers auth library (Better Auth / Lucia) on D1 — per-app, not foundational.

---

## 6. Game / prototype engine toolkit

There is **no single engine.** Each prototype picks the right tool; the umbrella is agnostic.

| Tool | Dim | Best for | Notes |
|------|-----|----------|-------|
| **Kaplay** (Kaboom successor) | 2D | Fast "is it fun" arcade / platformer / puzzle / shooter | Tiniest API; running in minutes. **Default for throwaway 2D.** |
| **Phaser** | 2D | 2D games with real systems expected to grow (tilemaps, physics, particles) | Mature, heavier, huge docs. The "this might become real" choice. |
| **react-three-fiber** (+ `drei`, `@react-three/rapier`) | 3D | Interactive 3D scenes & prototypes declared as React components; the landing doodle | A renderer, not a full engine — assemble systems for complex 3D. Pairs with the React umbrella. |
| **Three.js** (raw) | 3D | 3D visual experiments without React | Full control, more boilerplate. |
| **p5.js** | 2D | Generative art / physics doodles (not really games) | Creative-coding, instant. |

- **Build tool across all built projects: Vite** — instant hot-reload for iteration,
  static output that drops into the deploy dir.
- **Engine ownership note:** Kaplay/Phaser own the canvas + game loop — if mounted on a
  React page, a thin wrapper component starts the game and lets the engine run itself; the
  game logic stays in the engine. r3f is the opposite — there, React *is* the scene.

### Godot graduation path

Prototype in the web engine that's fastest for the idea → if it's fun, rebuild in **Godot**
(scene + node engine, strong 2D and 3D). What transfers: the **game design** (is it fun,
what are the mechanics) plus concepts that map directly — Phaser/Kaplay scenes & bodies →
Godot 2D nodes; r3f/Three meshes/lights/cameras → Godot 3D nodes. Godot's **web export
(WASM)** drops into `public/<name>/` like any other static project.

**Export caveat:** *threaded* Godot 4 web exports need `SharedArrayBuffer`, which requires
cross-origin-isolation headers (COOP/COEP). Default: **export non-threaded** (supported
since Godot 4.3) — no headers needed. If a game needs threads, add a `_headers` file
scoped to `/<name>/*` (natively supported by Workers static assets).

---

## 7. Asset generation (r3f)

In r3f, **assets are code**, generated in the same file as game logic with hot-reload:

1. **Primitives — instant:** every Three.js shape is a JSX tag (`boxGeometry`,
   `sphereGeometry`, `cylinderGeometry`, `coneGeometry`, `torusGeometry`,
   `icosahedronGeometry`, `planeGeometry`, …) with inline materials/color.
2. **Compound + procedural:** assemble primitives into characters/objects, `<Instances>`
   for many copies, `THREE.ExtrudeGeometry` / `<Shape>` for extruded forms, parametric
   geometry, `drei` helpers (`<RoundedBox>`, `<Text3D>`, `<OrbitControls>`). Covers all
   greyboxing / blockout / programmer-art.
3. **Boundary — organic art = import, not generate:** sculpted/textured models come from a
   `.glb` and are wired up with `useGLTF('/models/x.glb')`; `gltfjsx` auto-converts a
   `.glb` into a ready r3f component. Free CC0 sources: **Kenney.nl**, **Quaternius**,
   **Poly Haven**; AI text-to-3D (Meshy / Luma / Rodin) for one-offs.

Pipeline: **greybox in code now → swap in real GLTF later** without rearchitecting the scene.

---

## 8. Repo structure

```
jerrydwalters.com/
├─ src/                       # Astro umbrella
│  ├─ pages/
│  │  ├─ index.astro          # landing: name/contact + r3f 3D doodle island
│  │  └─ projects.astro       # auto-generated index of the hub
│  └─ components/
│     └─ Scene.tsx            # react-three-fiber island
├─ public/                    # served verbatim — anything here is live at its path
│  ├─ <name>/                 # no-build static projects → /<name>
│  └─ models/                 # shared .glb assets (not a project; see index rule)
├─ projects/                  # built projects (Vite apps), assembled into deploy output
│  └─ <name>/                 #   base: '/<name>/'
├─ worker/
│  └─ index.ts                # single worker entry (Hono router) → /api/*
├─ wrangler.jsonc             # assets dir, run_worker_first: ["/api/*"], bindings
├─ astro.config.mjs           # Astro + React integration (no Cloudflare adapter — static)
├─ package.json               # pnpm scripts: build umbrella + each project → dist/
└─ docs/superpowers/specs/    # this spec + future design docs
```

- **Package manager:** pnpm.
- **Root build:** builds the Astro umbrella, then each `projects/<name>` Vite app, and
  assembles all outputs (+ `public/` passthrough) into `dist/`.
- **`/projects` index rule (friction-minimal, unambiguous):** a directory counts as a
  project iff it is `public/<name>/` **containing an `index.html`**, or any
  `projects/<name>/`. Shared asset folders (e.g. `public/models/`) have no `index.html`
  and are naturally excluded. Optional per-project `meta.json` (title, blurb) enriches the
  index; absent one, the folder name is the title.
- **Cloudflare config (`wrangler.jsonc`):** `assets.directory = "./dist"`,
  `assets.run_worker_first = ["/api/*"]`, `main = "worker/index.ts"`; D1/KV bindings added
  when first needed. Deploys via **Workers Builds** (connect GitHub repo; enable
  non-production branch builds for preview URLs).

### Local development

- `pnpm dev` — Astro dev server for the umbrella.
- Per-project Vite dev server for an individual built project.
- `wrangler dev` — run the worker + assets + local D1/KV simulators against the assembled
  `dist/`. (The Cloudflare Vite plugin is available if a built project wants bindings
  inside Vite dev.)

---

## 9. DNS migration (Netlify → Cloudflare) — do this BEFORE any Netlify teardown

Current state: domain registered at **DreamHost**; nameservers point to **Netlify DNS**
(`*.nsone.net` / NS1); hosting + DNS both on Netlify.

**Pre-flight audit (done 2026-06-11):** the zone has **no MX and no TXT records** — no
email or domain verifications to preserve; only apex/`www` A-records matter. Still
screenshot/export the Netlify DNS record list before the flip and diff against what
Cloudflare imports (Cloudflare's zone scan is best-effort).

**Order matters — moving nameservers is the cutover; do not delete anything at Netlify
until Cloudflare is verified serving.**

1. **Build & deploy the new site to the Worker first**, on its `*.workers.dev` URL.
   Verify the landing + at least one sample project work there. Nothing touches the live
   domain yet.
2. **Add `jerrydwalters.com` to Cloudflare** (dashboard → Add a site → Free). Review the
   imported records against the Netlify export.
3. **Check DNSSEC at DreamHost** before changing nameservers: if DS records exist at the
   registrar, remove them first or resolution breaks for validating resolvers (likely
   already off — NS1/Netlify DNS didn't use it — but it's a 30-second check).
4. **Pre-verify Cloudflare's zone** directly against the assigned nameservers:
   `dig @<assigned>.ns.cloudflare.com jerrydwalters.com A` (and `www`) must return the
   expected answers *before* the registry delegates to it.
5. **Attach the domain to the Worker:** add `jerrydwalters.com` + `www` as **Custom
   Domains** on the Worker (Cloudflare manages the records; requires the zone from step 2).
6. **At DreamHost (registrar): change the nameservers** from Netlify's NS1 set to the two
   assigned Cloudflare nameservers. (Panel → Domains → Manage → Nameservers → "Use your
   own nameservers".)
7. **Wait for propagation.** NS delegation TTL for `.com` is registry-controlled (~48h
   worst case, can't be lowered); some resolvers will serve the *old* site meanwhile —
   harmless, both are live. Verify: `dig jerrydwalters.com NS` shows
   `*.ns.cloudflare.com`, and `https://jerrydwalters.com` + `www` serve the new site
   (`server: cloudflare` header, no `x-nf-request-id`).
8. **Rollback safety:** the old Netlify site stays fully live until this is confirmed. If
   anything is wrong, point nameservers back to NS1 at DreamHost to revert.

### 9b. Registrar transfer (DreamHost → Cloudflare Registrar) — after step 7 is verified

Goal: registrar + DNS + hosting in one Cloudflare account. Cloudflare Registrar requires
the zone to already be active on Cloudflare — satisfied by the steps above.

1. At DreamHost: **unlock the domain** and request the **EPP/auth code**. Disable WHOIS
   privacy if it blocks transfer initiation (Cloudflare applies its own redaction after).
2. In Cloudflare: **Domain Registration → Transfer Domains** → enter the auth code. Pays
   at-cost (~$11 for `.com`) which **adds a year** to the existing expiry (2027) — nothing
   is lost.
3. Approve the transfer (or let it auto-complete in ~5 days). **DNS keeps working
   throughout** — the zone is already serving on Cloudflare; only the registration moves.
4. Timing note: registrations can't transfer within 60 days of certain registrant changes;
   this domain is long-settled, so no wait applies.

---

## 10. Netlify teardown (remove the old site) — only AFTER §9 step 7 is verified

> ⚠️ **Netlify is currently the DNS provider, not just the host.** If you delete the Netlify
> site or DNS zone before the nameserver switch has propagated to Cloudflare, the domain
> stops resolving. Complete and verify §9 (through step 7) first.

Once the new site is confirmed serving on Cloudflare:

1. **Confirm cutover:** `dig jerrydwalters.com NS` shows Cloudflare nameservers, and the
   live site responds with `server: cloudflare` and no `x-nf-request-id` header.
2. **Delete the old Netlify site:** Netlify dashboard → the site → **Site configuration →
   Danger zone → Delete site**. (Alternatives: `netlify sites:delete` via netlify-cli, or
   connect the **Netlify MCP** and Claude runs the teardown.)
3. **Remove the Netlify DNS zone** for `jerrydwalters.com` (Netlify → Domains → remove).
   Safe now that delegation no longer points at NS1.
4. **Disconnect the GitHub integration:** if Netlify's GitHub App is no longer used by any
   other site, revoke its repo access (GitHub → Settings → Applications → Netlify).
5. **Old repo:** already renamed to `jerrywalters/jerrydwalters.com-legacy` — **kept**,
   simply never deployed anywhere again. Local clone lives at
   `~/personal-projects/jerrydwalters.com-legacy` (remote updated).
6. **Firebase `portfolio-chat` project:** the old site's chat backend. No longer used —
   delete in the Firebase console, or leave dormant (costs nothing idle). Optional.

---

## 11. Out of scope (YAGNI)

- Multi-user / public auth — not built until a specific app needs it (Access covers
  personal use).
- CMS / blog — not requested.
- Carrying over any old code (React 15, redux, the firebase chat, twilio).
- Git submodules / polyrepo structure — see §4 growth path.
- Up-front provisioning of D1/KV/R2 — created on first need.
- Designing the landing's visual look in detail — separate design pass once the skeleton
  is live.

---

## 12. Decisions log

| Decision | Choice |
|---|---|
| Platform | Cloudflare **Workers + static assets** (revised from Pages after review) |
| Umbrella | Astro + React islands; r3f for 3D; no Cloudflare adapter (static) |
| Routing | Subpaths now; subdomains promotable later |
| Domain | Keep `jerrydwalters.com`; transfer registration to Cloudflare Registrar post-cutover |
| Auth for personal apps | Cloudflare Access (zero auth code) |
| Repo | `jerrywalters/jerrydwalters.com`, public; old repo kept as `-legacy`, undeployed |
| Project isolation | Monorepo directories; no submodules; promote to own repo/subdomain when big |
| Cloudflare account | `jerrydwalters@gmail.com` (MCP connected) |

Remaining open item: **landing visual design** — deferred to its own pass.
