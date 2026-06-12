import { defineConfig } from 'vite';

// Served at jerrydwalters.com/dodge/ — assets must resolve under that base.
export default defineConfig({
  base: '/dodge/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
