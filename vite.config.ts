import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // El build clava esta ruta en todos los assets, así que tiene que coincidir con
  // la carpeta donde se publica. Se puede pisar para subir a otra:
  //   BASE_PATH=/claro/dev/ npm run build
  base: process.env.BASE_PATH || '/claro/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true,
  },
});
