# jerrydwalters.com

A personal site **and** an umbrella hub for small apps and browser game prototypes.
The root is a minimal landing (a spinning 3D plunger); everything else is an independent
project served at its own subpath. Built to make spinning up a new thing nearly free:
add a folder, push, it's live.

- **Umbrella:** Astro + React islands (three.js / react-three-fiber for 3D)
- **Host:** Cloudflare Workers (static assets) + Cloudflare DNS
- **Backends (lazy):** Workers `/api/*` (Hono) with D1 / KV / R2; Cloudflare Access for
  personal-app auth — added only when a project needs them.

Design rationale lives in [`docs/superpowers/specs/`](docs/superpowers/specs/); the build
plan in [`docs/superpowers/plans/`](docs/superpowers/plans/).

## Quick start

```bash
pnpm install
pnpm dev        # Astro dev server (umbrella) → http://localhost:4321
pnpm build      # builds the umbrella + every project into dist/
pnpm preview    # serves the built dist/ exactly like production (use this to click the whole hub)
```

> **Local dev note.** `pnpm dev` (Vite) serves the Astro pages with hot-reload but does
> **not** directory-index the static game folders (`/catch` → 404; `/catch/index.html`
> works) and doesn't serve built projects at all. To click around the **full** hub —
> games included — use `pnpm preview` (after `pnpm build`) or `pnpm cf:dev` (`wrangler dev`,
> the production runtime). Production resolves bare subpaths fine.

## Adding a project

Two tiers — pick the smallest that fits. Both appear automatically on `/projects`
(scanned at build time; an optional `meta.json` supplies the title + blurb).

### 1. No-build (most prototypes) → `public/<name>/`

Drop a self-contained folder; it's live at `/<name>`.

```
public/snake/
  index.html        # your game/app (vanilla, or a CDN engine like Kaplay/Three)
  meta.json         # { "title": "Snake", "blurb": "…" }   (optional)
```

See `public/catch/` for a working example (vanilla canvas, zero deps).

### 2. Built (needs TypeScript / npm deps / bundling) → `projects/<name>/`

A standalone Vite app. The root build compiles it and assembles the output into
`dist/<name>/`, served at `/<name>`.

```
projects/dodge/
  package.json      # its own deps (e.g. kaplay), "build": "vite build"
  vite.config.ts    # base: '/<name>/'   ← required so assets resolve
  index.html
  src/main.ts
  meta.json         # optional
```

Then `pnpm install` (links the workspace) and `pnpm build`. See `projects/dodge/`
(Kaplay + Vite) for a working example.

**Engine toolkit:** Kaplay (fast 2D games) · Phaser (2D that grows) · react-three-fiber
(3D, pairs with the umbrella) · Three.js (raw 3D) · p5.js (doodles). A prototype that
proves fun can graduate to Godot — its web export drops into `public/<name>/` like any
static project.

## Adding a backend to a project

The site is static by default. To add capability:

- **Saved data, no login** (high scores, "save my run"): a route in `worker/index.ts` +
  a **KV** namespace. Key convention: `"<project>:..."`.
- **A personal app with login** (e.g. a practice tracker): worker routes + a **D1**
  database (one per app), gated by **Cloudflare Access** (no auth code — login is your
  Google/GitHub identity at the edge).

Create the binding only when you need it, then uncomment/add it in `wrangler.jsonc` and
the `Bindings` type in `worker/index.ts`.

## Deploy

Hosted on **Cloudflare Workers** (static assets + the `/api/*` Hono worker).

```bash
pnpm cf:dev     # run the worker + assets locally (workerd) → http://localhost:8788
pnpm deploy     # wrangler deploy (needs `wrangler login` once)
```

Preferred: connect the repo to **Workers Builds** in the Cloudflare dashboard so every
push to `main` builds (`pnpm build`) and deploys, with preview URLs on branches.

## Structure

```
src/            Astro umbrella (landing, /projects index, Scene.tsx r3f island)
public/<name>/  no-build projects (served verbatim)
projects/<name>/ built projects (Vite → assembled into dist/<name>/)
worker/index.ts single Hono worker, runs only for /api/*
scripts/build-projects.mjs   assembles built projects into dist/
wrangler.jsonc  Workers config (assets dir, run_worker_first, lazy bindings)
```
