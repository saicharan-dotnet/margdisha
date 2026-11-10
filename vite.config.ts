import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `--mode single` inlines everything into one HTML file for a shareable demo.
export default defineConfig(({ mode }) => ({
  plugins: mode === 'single' ? [react(), viteSingleFile()] : [react()],
  base: mode === 'single' ? './' : '/',
  build: { outDir: mode === 'single' ? 'dist-single' : 'dist' },
}));
