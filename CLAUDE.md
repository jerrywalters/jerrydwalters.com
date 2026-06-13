# CLAUDE.md

Guidance for Claude Code (and any agent) working in this repo. **Multiple agents
run in parallel here — follow the workflow below so we don't step on each other.**

## What this is

`jerrydwalters.com` — a personal site and umbrella hub for small apps and browser
game prototypes, hosted on Cloudflare Workers (static assets) + Cloudflare DNS.
Astro + React islands; three.js / react-three-fiber for 3D. See `README.md` for
structure and how to add a project, and `docs/superpowers/specs/` for design
rationale.

## Workflow — branch + PR, never commit to `main`

`main` is **production**: pushing to it auto-deploys to jerrydwalters.com. **Do
not commit or push to `main` directly.**

For any change:

1. **Work in your own git worktree** (so parallel agents don't share a working
   tree):
   ```bash
   git worktree add .worktrees/<short-name> -b <short-name> origin/main
   cd .worktrees/<short-name>
   ```
   Confirm with `pwd` and `git branch --show-current` before editing.
2. **Commit incrementally** — small, focused commits with clear messages, not one
   giant dump at the end.
3. **Open a PR** against `main` (`gh pr create --base main`). Integrate through
   the PR; don't fast-forward `main` locally and push.
4. **After merge**, clean up: `git worktree remove .worktrees/<short-name>`.

Branch names: short, descriptive, kebab-case (e.g. `add-snake-game`,
`fix-starfield-jitter`). No usernames.

### Parallel-agent etiquette
- Work only inside your own worktree.
- Don't touch files with uncommitted changes you didn't make, and never revert
  another agent's work. If `git status` shows dirty files you didn't create,
  leave them alone.

## Verify before you open a PR
- `pnpm build` must pass (builds the umbrella + every project into `dist/`).
- For anything visual, look at it in a browser: `pnpm preview` serves the real
  built output with production-style routing; `pnpm dev` is faster for iterating
  (but note Vite dev doesn't directory-index the `public/<name>/` games — use
  `pnpm preview` to click those). Confirm it looks right in **both** themes.

## Deploy (how it ships)
- **`main` → production** via Workers Builds (`pnpm build`, then deploy).
- **Other branches → preview versions, not prod**: `scripts/deploy.sh` routes
  `main` to `wrangler deploy` and every other branch to `wrangler versions
  upload`. This only holds if the Workers Builds **Deploy command** is
  `sh scripts/deploy.sh` — otherwise branch builds will deploy to production.
- Don't run `wrangler deploy` by hand; let Workers Builds handle deploys.

## Structure (quick map)
- `src/` — Astro umbrella (landing, `/projects` index, the r3f `Scene` island).
- `public/<name>/` — no-build projects (static files), live at `/<name>`.
- `projects/<name>/` — built projects (Vite), assembled into `dist/<name>/`.
- `worker/index.ts` — single Hono worker, runs only for `/api/*`.
- `scripts/`, `wrangler.jsonc` — build assembly + Cloudflare config.

## Adding a project
See **`README.md` → Adding a project** — two tiers: drop a self-contained folder
in `public/<name>/`, or a Vite app in `projects/<name>/`. Engine toolkit and the
backend/auth path are documented there too. A dedicated skill for scaffolding new
games/projects may land under `.claude/skills/` later.

## Assets — high-res models (STL → GLB)

3D scene models start as high-poly STLs and must be compressed before they ship
(a raw STL is multi-MB and slow to load). Use the one-shot script:

```bash
scripts/stl-to-glb.sh <input.stl> public/models/<name>.glb [simplify-ratio]
# ratio defaults to 0.4 — keep ~40% of the triangles
```

What it does, and why:
1. **STL → GLB (trimesh):** welds duplicate vertices, centers on the bounding-box
   center, and scales so the longest axis spans 2 units — every model arrives at a
   predictable size (fine-tune per-model with `SCALE` in the scene).
2. **Simplify (gltf-transform / meshoptimizer):** reduces to the target triangle
   ratio. ~0.4 both shrinks the file and gives the rough-hewn, faceted look.
3. **Quantize (gltf-transform):** stores positions as 16-bit
   (`KHR_mesh_quantization`) — decoded **natively by three.js**, so there is *no*
   runtime decoder dependency (unlike Draco). It just loads.

The GLB carries **geometry only — no normals, no materials.** The scene applies
its own `MeshStandardMaterial` (per-model colour) with `flatShading: true`, which
derives facet normals from positions. Recolour/orient in `Scene.tsx`, not the asset.

Verified example: `ranuelphe.glb` — `Ranuelphe-de-kyme.stl` (6.1 MB, 122k tris) →
489 KB, 48.8k tris (40%), position-quantized.

## Code style
- TypeScript throughout; match the style of the surrounding files (2-space
  indent, single quotes, small focused components/modules).
- Keep Astro pages light — push interactivity into React islands.
- Expose 3D scene tweakables (color/scale/orientation) as named constants, as in
  `src/components/Scene.tsx`.
