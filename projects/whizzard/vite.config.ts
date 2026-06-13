import { defineConfig } from 'vite';

// Served at jerrydwalters.com/whizzard/ — assets must resolve under that base.
export default defineConfig({
  base: '/whizzard/',
  build: { outDir: 'dist', emptyOutDir: true },
});
