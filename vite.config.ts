import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/check': {
        target: 'http://localhost:9001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/check/, '')
      }
    }
  }
});