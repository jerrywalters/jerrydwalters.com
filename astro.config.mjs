// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';

import react from '@astrojs/react';

// Dev-only: the umbrella `astro dev` server doesn't serve the per-project games at
// their /<name>/ path — no-build games (public/<name>/) aren't directory-indexed, and
// built games (projects/<name>/dist/) aren't assembled. In production a single static
// `dist/` holds both, so this middleware mirrors that for dev: it serves
// public/<name>/index.html for drop-a-folder games, and projects/<name>/dist/* for
// built games (run that project's `build` once so its dist/ exists). apply:'serve'
// keeps it out of the production build.
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
  '.glb': 'model/gltf-binary',
};

function devProjectServe() {
  return {
    name: 'dev-project-serve',
    enforce: 'pre',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = decodeURIComponent((req.url ?? '').split('?')[0]);
        const match = pathname.match(/^\/([^/.]+)(\/.*)?$/);
        if (!match) return next();
        const name = match[1];
        const rest = !match[2] || match[2] === '/' ? '/index.html' : match[2];
        const base = [
          path.join(process.cwd(), 'public', name),
          path.join(process.cwd(), 'projects', name, 'dist'),
        ].find((b) => fs.existsSync(path.join(b, 'index.html')));
        if (!base) return next();
        const file = path.normalize(path.join(base, rest));
        if (!file.startsWith(base) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
          return next();
        }
        res.setHeader('Content-Type', CONTENT_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream');
        res.end(fs.readFileSync(file));
      });
    },
  };
}

// React integration is added by `astro add react`. The site is fully static
// (no SSR), so no Cloudflare adapter is needed — it deploys as static assets.
export default defineConfig({
  site: 'https://jerrydwalters.com',
  integrations: [react()],
  vite: { plugins: [devProjectServe()] },
});
