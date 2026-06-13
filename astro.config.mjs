// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';

import react from '@astrojs/react';

// Dev-only: `astro dev` doesn't directory-index the no-build games under
// public/<name>/, so a bare /catch/ would 404 (only /catch/index.html resolves).
// This serves public/<name>/index.html for a /<name>/ request so the project links
// work while iterating. Built projects (projects/<name>) are assembled into dist/ at
// build time — preview those with `pnpm preview` or in production. apply:'serve' keeps
// this out of the production build.
function devGameDirectoryIndex() {
  return {
    name: 'dev-game-directory-index',
    enforce: 'pre',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? '').split('?')[0];
        const match = pathname.match(/^\/([^/.]+)\/?$/);
        if (match) {
          const indexFile = path.join(process.cwd(), 'public', match[1], 'index.html');
          if (fs.existsSync(indexFile)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(fs.readFileSync(indexFile));
            return;
          }
        }
        next();
      });
    },
  };
}

// React integration is added by `astro add react`. The site is fully static
// (no SSR), so no Cloudflare adapter is needed — it deploys as static assets.
export default defineConfig({
  site: 'https://jerrydwalters.com',
  integrations: [react()],
  vite: { plugins: [devGameDirectoryIndex()] },
});
