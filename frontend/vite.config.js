import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Talks to the Express backend on http://localhost:3000
// via a dev proxy, so there is no CORS setup needed.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/user': 'http://localhost:3000',
      '/candidate': 'http://localhost:3000',
    },
  },
});
