import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import { resolve } from 'path';
import manifest from './src/manifest.json';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: { format: { comments: false } },
  },
});
