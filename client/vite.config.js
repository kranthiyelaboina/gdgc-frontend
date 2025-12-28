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
})
