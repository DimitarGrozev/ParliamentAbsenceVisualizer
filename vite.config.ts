import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://www.parliament.bg',
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: 'https://www.parliament.bg',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
