import { defineConfig } from 'vite';
import shopify from 'vite-plugin-shopify';

export default defineConfig({
  plugins: [
    shopify({
      themeRoot: '.',
      sourceCodeDir: 'frontend',
      entrypointsDir: 'frontend/entrypoints',
    }),
  ],
  build: {
    // Don't wipe the assets/ folder — it may contain static Shopify assets
    emptyOutDir: false,
  },
});
