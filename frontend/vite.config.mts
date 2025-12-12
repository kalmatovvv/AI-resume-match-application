import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
          target: 'https://ai-resume-match-backend.vehzy5nf38634.us-east-1.cs.amazonlightsail.com', // Local dev server (or use 3000 for Docker)
          // target: 'http://localhost:3000', // Local dev server (or use 3000 for Docker)
        changeOrigin: true
      }
    }
  }
});


