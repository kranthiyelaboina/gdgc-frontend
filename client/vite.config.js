import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.lottie'],
  server: {
    port: 3000,
    historyApiFallback: true,
  },
  preview: {
    historyApiFallback: true,
  },
  build: {
    // Optimize CSS delivery
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
