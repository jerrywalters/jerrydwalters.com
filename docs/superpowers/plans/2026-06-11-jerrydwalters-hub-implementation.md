# Implementation Plan — jerrydwalters.com hub

Derived from [the design spec](../specs/2026-06-11-jerrydwalters-hub-design.md). Executed
autonomously overnight 2026-06-11. One commit per task; pushed directly to `main`.

## Constraints / ground rules
- One commit per task, clear messages, pushed to `main`.
- Build must be locally verifiable (`pnpm build` → `dist/`), and screenshot-verified.
- Do **not** create Cloudflare resources (D1/KV/R2) — lazy provisioning; no project needs
  them yet. Worker ships with only a `/api/health` route to prove the pattern.
- Deploy, DNS cutover, registrar transfer, Netlify teardown = **human todos** (need
  account access). Captured in `MORNING-TODOS.md`.
- Stack pinned for "it just builds": Astro 5 + @astrojs/react, React + three.js +
  @react-three/fiber + @react-three/drei, Hono worker, wrangler 4, pnpm workspaces.

## Tasks (one commit each)
1. **Scaffold** — Astro + React + TS, pnpm, `.gitignore`, base configs (`astro.config`,
   `tsconfig`), placeholder layout. Verify `pnpm build` works empty.
2. **Theme + landing shell** — dark-default / light-toggle (no-FOUC inline script,
   `localStorage` persistence), CSS variables, name in small text top-center, layout slot
   for the 3D scene.
3. **3D plunger** — `Scene.tsx` r3f island: lathe-geometry rubber cup + cylinder handle,
   lights, auto-rotate (+ drag), contact shadow, transparent canvas (theme-agnostic).
   Mounted dead-center on the landing.
4. **/projects auto-index** — page that globs `public/*/index.html` + `projects/*` and
   lists them; optional per-project `meta.json` for title/blurb.
5. **No-build sample project** — `public/catch/`: a tiny self-contained game (CDN engine,
   no build) proving the drop-a-folder → `/catch` path.
6. **Built sample project + assembly** — `projects/spinner/` (Vite + TS), `pnpm-workspace`,
   `scripts/build-projects.mjs` that builds each project and assembles output into
   `dist/<name>/`; wired into the root `build` script. Proves the built tier at `/spinner`.
7. **Worker + Cloudflare config** — `worker/index.ts` (Hono) with `/api/health`;
   `wrangler.jsonc` (assets dir, `run_worker_first: ["/api/*"]`, `main`). Validate with
   `wrangler deploy --dry-run`.
8. **Docs + morning todos** — `README.md` (how to add each project tier, local dev, deploy),
   `MORNING-TODOS.md` (the human-only steps with exact commands/links).

## Verification gates
- After task 6: `pnpm build` produces `dist/index.html`, `dist/projects/`,
  `dist/catch/index.html`, `dist/spinner/index.html`.
- Before final commit: serve `dist/` and screenshot the landing (plunger visible, both
  themes), `/projects`, `/catch`, `/spinner`; capture console for errors.
- `wrangler deploy --dry-run` succeeds (config valid) — actual deploy deferred to human.
