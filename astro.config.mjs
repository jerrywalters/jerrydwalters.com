// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// React integration is added by `astro add react`. The site is fully static
// (no SSR), so no Cloudflare adapter is needed — it deploys as static assets.
export default defineConfig({
  site: 'https://jerrydwalters.com',
  integrations: [react()],
});