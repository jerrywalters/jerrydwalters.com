# Morning todos ☀️

What I did overnight, and the handful of things that need your accounts/credentials.

## ✅ Done (built, verified, pushed to `main`)

The whole site is built and screenshot-verified locally — one commit per task:

- Astro 6 + React 19 + three.js umbrella; dark-default / light toggle.
- **Spinning 3D plunger** on the landing (modeled from primitives — lathe-geometry cup +
  turned handle). Verified rendering in both themes, no console errors.
- Auto-generated `/projects` index (build-time scan of both tiers).
- **Catch** — no-build sample game (`public/catch/`, vanilla canvas).
- **Dodge** — built sample game (`projects/dodge/`, Kaplay + Vite) + the assembly pipeline.
- Cloudflare Worker (`/api/health`, Hono) + `wrangler.jsonc`. Verified with
  `wrangler deploy --dry-run` **and** a local `workerd` run (API + static routing both work).
- README with "how to add a project" for both tiers.

**See it now:** `pnpm install && pnpm build && pnpm preview` → http://localhost:4321
(play `/catch/` and `/dodge/`, toggle the theme, drag the plunger).

Nothing is deployed yet — that needs your Cloudflare account. Order below matters.

---

## 1. Deploy to Cloudflare → get a live `*.workers.dev` URL (breaks nothing)

**Option A — Workers Builds (recommended; gives push-to-deploy CI + preview URLs):**
1. Cloudflare dashboard → **Workers & Pages → Create → Connect to Git**.
2. Pick `jerrywalters/jerrydwalters.com`. Build command: `pnpm build`. It auto-detects
   `wrangler.jsonc` and deploys.
3. Turn on **non-production branch builds** (Settings → Builds) if you want PR preview URLs.

**Option B — one-off from your machine (fastest):**
```bash
cd ~/personal-projects/jerrydwalters.com
wrangler login        # one-time browser auth
pnpm deploy           # → https://jerrydwalters-com.<account>.workers.dev
```

**Either way, verify the workers.dev URL:** plunger landing, `/projects`, `/catch/`,
`/dodge/`, and `/api/health` (JSON).

> 💡 I can do Option B for you next session if you leave a scoped `CLOUDFLARE_API_TOKEN`
> (Workers Scripts: Edit). Just say the word.

## 2. Point `jerrydwalters.com` at Cloudflare (DNS cutover) — spec §9

Only after step 1's workers.dev URL looks right. Full procedure is in
[the spec §9](docs/superpowers/specs/2026-06-11-jerrydwalters-hub-design.md). The critical
bits:
- **Check DNSSEC is OFF at DreamHost** before switching nameservers (skipping this is the
  one move that can take the domain offline). Your zone has **no MX/TXT** records — nothing
  else to preserve.
- Add `jerrydwalters.com` to Cloudflare → attach apex + `www` as **Custom Domains on the
  Worker** → switch nameservers at **DreamHost** (registrar) to the two Cloudflare ones.
- Old Netlify site stays live until this verifies; rollback = point NS back.

## 3. Transfer the registration DreamHost → Cloudflare Registrar — spec §9b
After cutover. ~$11 at-cost, adds a year to your 2027 expiry, DNS keeps working. Gets
registrar + DNS + hosting all into the one Cloudflare account, like you wanted.

## 4. Tear down the old Netlify site — spec §10 (do LAST, after cutover verifies)

The site to delete: **`upbeat-johnson-6c180f`**
(https://app.netlify.com/projects/upbeat-johnson-6c180f — serves www.jerrydwalters.com,
last deployed 2019).

> 💡 **The Netlify MCP is connected, so I can do this teardown for you** — just tell me
> "tear down the old Netlify site" once the cutover is verified, and I'll delete the site +
> DNS zone via the MCP. Or do it yourself: Netlify dashboard → site → Site configuration →
> Danger zone → Delete site, then remove its DNS zone.

## 5. Optional / later
- `portfolio-chat` Firebase project (old chat backend) — delete in the Firebase console or
  leave dormant.
- First time a game needs saved data or a personal app needs login: add KV/D1 (I can create
  these via the Cloudflare MCP) + wire the binding in `wrangler.jsonc`. Auth = Cloudflare
  Access.
- Replace the placeholder plunger favicon / polish the landing visuals (separate design pass).

---

### Things I can execute for you next session (with a nod / credentials)
- **Deploy** (Option B) — needs a `CLOUDFLARE_API_TOKEN`.
- **Netlify teardown** — via the connected MCP, after you confirm cutover.
- **Create KV/D1** — via the connected Cloudflare MCP, when the first project needs it.
