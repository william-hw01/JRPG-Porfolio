import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './', // This is correct
  build: {
    outDir: 'dist',
    assetsDir: '.', // Move assets to root of dist
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  publicDir: 'public', // Explicitly set public directory
  server: {
    host: true 
  }
})