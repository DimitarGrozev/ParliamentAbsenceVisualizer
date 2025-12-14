import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Output to backend's wwwroot folder
    outDir: path.resolve(__dirname, '../backend/wwwroot'),
    emptyOutDir: true,

    // Optimize minification - remove console.logs in production
    minify: 'terser',

    // Manual chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // React core (50 KB)
          'react-vendor': ['react', 'react-dom'],

          // MUI core components (300 KB)
          'mui-core': [
            '@mui/material',
            '@emotion/react',
            '@emotion/styled'
          ],

          // MUI icons (150 KB)
          'mui-icons': ['@mui/icons-material'],

          // Date picker library (100 KB)
          'mui-pickers': ['@mui/x-date-pickers', 'date-fns'],
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to .NET backend during development
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy image requests to .NET backend during development
      '/images': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
