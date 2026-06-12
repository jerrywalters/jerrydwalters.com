import { Hono } from 'hono';

/**
 * The single Worker entry. Per wrangler.jsonc `run_worker_first: ["/api/*"]`,
 * this only runs for /api/* requests — everything else is served straight from
 * static assets (free, no Worker invocation). Add D1/KV/R2 bindings here as
 * individual projects need them (lazy provisioning).
 */
type Bindings = {
  ASSETS: Fetcher;
  // KV: KVNamespace;        // add when the first save-data project lands
  // DB: D1Database;         // add per personal app (one DB each)
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/api/health', (c) =>
  c.json({
    ok: true,
    service: 'jerrydwalters.com',
    time: new Date().toISOString(),
  })
);

// Any undefined /api/* route returns JSON 404 (not the static 404 page).
app.all('/api/*', (c) => c.json({ error: 'not_found' }, 404));

export default app;
