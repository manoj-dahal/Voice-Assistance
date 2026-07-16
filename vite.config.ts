import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: 'src/renderer',
  publicDir: resolve(projectRoot, 'resources/public'),
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': 'http://localhost:8787',
      '/remember': 'http://localhost:8787'
    }
  },
  build: {
    outDir: resolve(projectRoot, 'dist'),
    emptyOutDir: true
  },
  preview: {
    port: 4173,
    host: true
  },
  test: {
    include: [
      'src/**/*.test.ts',
      '../../testing/**/*.test.mjs'
    ]
  }
})
