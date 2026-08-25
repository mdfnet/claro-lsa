import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: process.env.BASE_PATH || '/claro/',
  plugins: [react()],
  // Reuse the parent project's public assets (icons, etc.)
  publicDir: path.resolve(__dirname, '../public'),
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['react', 'react-dom'] },
      },
    },
  },
  server: {
    host: true,
    port: 5174,
  },
});
