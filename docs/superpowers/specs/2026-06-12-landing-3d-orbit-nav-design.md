# Landing 3D orbit-nav with in-place split-view sections

- **Status:** Design approved 2026-06-12 (assets + materials signed off). Implements the
  "landing visual design" pass deferred in the hub spec (`2026-06-11-...-design.md` §11/§12).
- **Date:** 2026-06-12
- **Owner:** Jerry Walters

---

## 1. Overview

The landing page becomes a small 3D navigation hub. Three objects float in a shared,
slowly-rotating orbit over the existing 2D starfield backdrop. Each object is a doorway to
one section. Clicking an object slides it to the left and brings in a content panel on the
right (desktop) or a full-screen overlay (mobile). It's a **persistent-model split view**,
not page-to-page navigation — one continuous WebGL canvas drives the whole experience.

This is the deferred landing-visual pass; it does not change hosting, the project model, or
the `/api` worker.

## 2. Sections, objects, materials

Each section owns one 3D object. Mapping is locked; materials are signed off.

| Section | Object (asset) | Material (applied in `Scene.tsx`, not baked) |
|---|---|---|
| **About** | statue — `ranuelphe.glb` | existing grey space-rock (`MeshStandardMaterial`, flatShading facets) |
| **Physical projects** | cast-iron radiator — `radiator.glb` | iron body `#86888d` metalness 0.82 roughness 0.5 (satin pewter); brass valves `#9c8348` metalness 0.9 roughness 0.45. Mesh names `body` / `brass` carry the split. Smooth normals. |
| **Digital projects** | CD — `cd.glb` | keep the model's own textures (reflective foil + printed label); add scene env map so the foil shimmers. Optional `iridescence` on the foil mesh for the rainbow. |

- **Models→sections is config**, one line each — reassignable.
- All assets are ~1 MB, geometry-conventions per `CLAUDE.md → Assets` (radiator/CD were
  cleaned: wall/floor removed, textures stripped or compressed, simplified, quantized).
- **Digital projects inherits the existing `/projects` content** (the apps/games hub — those
  *are* the digital projects).
- **About** and **Physical** are net-new content (see §6).

## 3. Interaction model (two states)

**Overview (default):** the 3 objects share a slow central orbit, each also spinning in
place. Hovering an object → a rim highlight (drei `<Outlines>` or a soft fresnel) **plus
`cursor: pointer`**.

**Section view (after a click):** the chosen object animates to a left anchor; the other two
recede; a content panel slides in on the right. The URL updates to the section route. A small
persistent **mini-nav** (the 3 labels) keeps all sections reachable without returning to
overview. **Back to overview:** click the active object, press `Esc`, or a back control.

**Mobile:** the panel is a full-screen overlay over the model (not a separate page); back
closes it. One code path; the model stays present.

## 4. 3D scene architecture (`Scene.tsx`)

- Refactor the single hard-coded `<Model>` into a **config-driven array**: each entry
  `{ id, route, label, modelUrl, scale, orient, material, orbitAngle }`.
- One persistent `<Canvas>` survives all state changes — this is what makes the slide smooth.
- One `<Model>` component mapped 3×, each with `onClick` / `onPointerOver` / `onPointerOut`
  (r3f raycasting — free). Pointer handlers set the rim highlight + `document.body.style.cursor`.
- **Layout transition:** lerp the active model toward the left anchor and ease the others
  out; `prefers-reduced-motion` snaps instead of animating.
- **Lighting:** add an environment map (drei `<Environment>` / `RoomEnvironment` PMREM) so
  the radiator's satin metal and the CD's foil actually reflect. Current scene has only
  directional lights — metals read flat without this.
- Keep the existing per-model spin/tumble.

## 5. DOM / routing / accessibility

- **Split layout:** left = the canvas; right = a content panel (empty in overview, populated
  in section view). Panels are React/Astro components.
- **Real URLs, not JS-only:** sections are deep-linkable via the History API + Astro **view
  transitions**, and each section is **also prerendered as a static page** (`/about`,
  `/<physical>`, `/<digital>`) rendering the same panel content server-side. So crawlers, no-JS,
  and keyboard users get real content + real `<a>` links; with JS the 3D experience hydrates
  over it. `/projects` stays canonical for digital.
- **Accessibility:** respect `prefers-reduced-motion` (no orbit/slide; snap). A
  visually-hidden link list + the mini-nav make the whole thing keyboard- and
  screen-reader-navigable. The 3D is an enhancement, never the only way in.

## 6. Content (net-new panels)

- **About:** photo + short bio blurb + résumé link + social links.
- **Physical projects:** a responsive image grid of physical builds (empty-friendly; grows
  over time).
- **Digital projects:** reuse the existing `/projects` auto-generated index.

Exact copy/photo/résumé/social URLs are provided by Jerry during the build.

## 7. Route labels — OPEN (placeholder defaults)

Final labels for the two project routes are undecided. **Working defaults (rename anytime,
one-line change):** `/about` ("About"), `/physical` ("Physical projects"), `/digital`
("Digital projects"). Candidate pairs considered: Atoms/Bits, Workshop/Software,
Handwork/Software, Made/Code.

## 8. Out of scope / decided-later

- Final route labels (§7).
- Env-map choice (studio vs custom HDR) — start with `RoomEnvironment`.
- The exact orbit motion params, highlight style (outlines vs fresnel), and transition
  easing — tuned live during the build.
- No new hosting/bindings; no change to the project/engine model.

## 9. Reused vs net-new

- **Reused:** starfield, existing `/projects` index, the asset pipeline + cleaned models,
  favicon/header work, theme toggle.
- **Net-new:** `Scene.tsx` orbit refactor, the section-view state machine, camera/layout
  transition, env map, hover highlight, About + Physical panels/pages, deep-link wiring.
