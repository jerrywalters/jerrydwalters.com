# jerrydwalters.com — Personal App / Game Hub

- **Status:** Draft (approved direction, pending spec review)
- **Date:** 2026-06-11
- **Owner:** Jerry Walters (`jerrydwalters@gmail.com`, GitHub `jerrywalters`)
- **Supersedes:** the existing React-15 / three.js site currently hosted on Netlify

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

- **One Git repo → one Cloudflare Pages project.** Auto-deploy on push to `main`;
  free per-PR / per-branch preview URLs.
- **DNS on Cloudflare** (moved from Netlify). **Subpaths now** (`/project`); **wildcard
  subdomains** promotable later with no migration.
- **One platform spans static → dynamic**, so a project can grow capability without
  changing hosts:
  - **Cloudflare Pages Functions** → API routes at `/api/*`
  - **D1** — serverless SQLite, for relational app data (the guitar tracker)
  - **KV** — key/value, for simple save data / high scores
  - **R2** — object storage, for files/assets if ever needed
  - **Cloudflare Access** (Zero Trust) — auth for personal apps, *no auth code*

```
                         ┌─────────────────────────────┐
   push to GitHub  ──▶   │   Cloudflare Pages (build)   │
                         │   - Astro umbrella → static  │
                         │   - public/<name> passthrough│
                         │   - projects/<name> Vite blds│
                         │   - functions/ → /api/*       │
                         └──────────────┬──────────────┘
                                        │ bindings
                      ┌─────────────────┼───────────────────┐
                      ▼                 ▼                   ▼
                    D1 (SQL)         KV (saves)          R2 (files)
                      ▲
              Cloudflare Access gates personal apps (Google/GitHub identity)
```

---

## 3. The umbrella (root site)

- **Stack: Astro + React islands.**
  - Astro ships **zero JS by default**; interactive bits are React components mounted as
    islands (`<Scene client:load />`). The landing stays feather-light.
  - The **cryptic 3D doodle** is a **react-three-fiber** island on the landing page.
  - An **auto-generated `/projects` index** lists everything in the hub as it grows.
- React is used exactly where it earns its weight (3D, interactive widgets), not site-wide.
- *Rejected alternative:* a pure Vite + React SPA umbrella — simpler "all React" mental
  model, but ships more JS for a minimal landing and requires hand-maintaining the index.
  Astro-with-React-islands keeps full React-ability without that cost.

---

## 4. Project model — two ways to add a project

| Tier | Where it lives | Becomes live at | When to use |
|------|----------------|-----------------|-------------|
| **No-build** | `public/<name>/` (index.html + JS, CDN scripts) | `/<name>` | Most prototypes. Drop a folder, push, done. Maximum velocity. |
| **Built** | `projects/<name>/` (Vite app, `base: '/<name>/'`) | `/<name>` | Needs bundling / TypeScript / npm deps. Root build script assembles output into the deploy dir. |

The no-build path is the default and the common case. The built path is an opt-in upgrade
for a single project; it does not change anything about the others.

---

## 5. Capability tiers (a project picks one)

1. **Static** — pure front end (games, doodles). Default.
2. **+ Simple persistence** — high scores / "save my run": a Pages Function + **KV**,
   keyed by an anonymous device id. No login.
3. **+ Full personal app** — e.g. guitar-practice tracker: Pages Functions + **D1**,
   gated by **Cloudflare Access** so only Jerry's Google/GitHub identity can log in.
   Zero auth code, zero auth UI.
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
(WASM)** drops into `public/<name>/` like any other static project — same hosting, no new
infra.

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
│  └─ <name>/                 # no-build static projects → /<name>
├─ projects/                  # built projects (Vite apps), assembled into deploy output
│  └─ <name>/                 #   base: '/<name>/'
├─ functions/                 # Cloudflare Pages Functions
│  └─ api/                    #   → /api/*  (KV / D1 access)
├─ wrangler.toml              # D1 / KV / R2 bindings, project config
├─ astro.config.mjs           # Astro + React integration + Cloudflare adapter
├─ package.json               # pnpm scripts: build umbrella + each project → dist/
└─ docs/superpowers/specs/    # this spec + future design docs
```

- **Package manager:** pnpm.
- **Root build:** builds the Astro umbrella, then each `projects/<name>` Vite app, and
  assembles all outputs (+ `public/` passthrough) into a single deploy directory.
- **Cloudflare Pages config:** connect the GitHub repo; build command runs the root build;
  output dir is the assembled deploy directory; Functions auto-detected from `functions/`;
  D1/KV/R2/Access bindings configured in the Pages project + `wrangler.toml`.

### Local development

- `pnpm dev` — Astro dev server for the umbrella.
- Per-project Vite dev server for an individual built project.
- `wrangler pages dev` — run Functions + D1/KV locally against the assembled output.

---

## 9. DNS migration (Netlify → Cloudflare) — do this BEFORE any Netlify teardown

Current state: domain registered at **DreamHost**; nameservers point to **Netlify DNS**
(`*.nsone.net` / NS1); hosting + DNS both on Netlify.

**Order matters — moving nameservers is the cutover; do not delete anything at Netlify
until Cloudflare is verified serving.**

1. **Build & deploy the new site to Cloudflare Pages first**, on its `*.pages.dev` URL.
   Verify the landing + at least one sample project work there. Nothing touches the live
   domain yet.
2. **Add `jerrydwalters.com` to Cloudflare** (Cloudflare dashboard → Add a site). Cloudflare
   scans and imports the existing DNS records. Review them.
3. **Assign apex + `www` to the Pages project** (custom domains in the Pages project, or the
   appropriate CNAME/`A`/`AAAA` records Cloudflare provisions for Pages).
4. **At DreamHost (registrar): change the nameservers** from Netlify's NS1 set to the two
   Cloudflare nameservers Cloudflare assigns you. (DreamHost panel → Domains → Manage →
   Nameservers → "Use your own nameservers".)
5. **Wait for propagation** (minutes to a few hours; up to 48h worst case). Verify with
   `dig jerrydwalters.com NS` (should show `*.ns.cloudflare.com`) and that
   `https://jerrydwalters.com` + `https://www.jerrydwalters.com` serve the new site with
   Cloudflare TLS.
6. **Rollback safety:** the old Netlify site stays fully live until this is confirmed. If
   anything is wrong, point nameservers back to NS1 at DreamHost to revert.

---

## 10. Netlify teardown (remove the old site) — only AFTER §9 is verified

> ⚠️ **Netlify is currently the DNS provider, not just the host.** If you delete the Netlify
> site or DNS zone before the nameserver switch in §9 has propagated to Cloudflare, the
> domain stops resolving. Complete and verify §9 first.

Once the new site is confirmed serving on Cloudflare:

1. **Confirm cutover:** `dig jerrydwalters.com NS` shows Cloudflare nameservers, and the
   live site is the new Cloudflare-hosted one (check response header `server: cloudflare`,
   no `x-nf-request-id`).
2. **Delete the old Netlify site:** Netlify dashboard → the site → **Site configuration →
   Danger zone → Delete site** (or unlink the repo first if you want to keep build history
   briefly). CLI alternative: `netlify sites:delete <site-name>` (requires `netlify-cli`).
3. **Remove the Netlify DNS zone** for `jerrydwalters.com` (Netlify → Domains → the domain →
   remove). Safe now that DreamHost points at Cloudflare instead of NS1.
4. **Disconnect the GitHub integration:** if Netlify's GitHub App is no longer used by any
   other site, revoke its repo access (GitHub → Settings → Applications → Netlify) so it no
   longer has access to your repos.
5. **Old GitHub repo (`jerrywalters/jerrydwalters.com`):** **archive** it (Settings →
   Archive this repository) for nostalgia, or delete. Recommend archive.
6. **Firebase `portfolio-chat` project:** the old site's chat backend. No longer used —
   delete it in the Firebase console if you don't want the data, or leave it dormant.
   (Optional; it costs nothing idle.)
7. **Local cleanup:** once the old GitHub repo is archived, remove the old local clone at
   `~/personal-projects/jerrydwalters.com`. (No VPS/Docker host to decommission — despite
   the old repo's `Dockerfile`, the site was actually served by Netlify.)

---

## 11. Out of scope (YAGNI)

- Multi-user / public auth — not built until a specific app needs it (Access covers
  personal use).
- CMS / blog — not requested.
- Carrying over any old code (React 15, redux, the firebase chat, twilio).
- Designing the landing's visual look in detail — that's a separate design pass once the
  skeleton is live.

---

## 12. Open items (resolved during planning, not blockers)

- **Final GitHub repo name** for the new site (local working dir is currently
  `jerrydwalters.com-v2`; rename once the old repo is archived).
- **Cloudflare account** to deploy under (confirm which account owns it).
- **Landing visual design** — deferred to a later pass.
