import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx, ManifestV3Export } from '@crxjs/vite-plugin';
import manifest from './src/manifest.json';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest: manifest as ManifestV3Export }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html',
        webapp: 'src/webapp/index.html',
      },
    },
  },
}); 