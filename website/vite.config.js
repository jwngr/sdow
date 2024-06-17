import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true, // Open browser when server starts.
  },
  plugins: [react()],
});
