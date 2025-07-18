import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: resolve(__dirname, 'public'),
  base: '/size-of-anything/',
  server: {
    fs: {
      // Allow serving files from one level up the project root
      allow: ['..']
    }
  }
})
