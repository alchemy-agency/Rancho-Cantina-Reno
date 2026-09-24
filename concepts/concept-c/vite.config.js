import { defineConfig } from 'vite'
export default defineConfig({
  build: { target: 'es2020', assetsInlineLimit: 2048, cssCodeSplit: false },
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
})
