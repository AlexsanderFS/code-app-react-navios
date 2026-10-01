import { existsSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { powerApps } from '@microsoft/power-apps-vite/plugin'

export default defineConfig({
  base: './',
  server: { host: 'localhost', port: 5173, strictPort: true },
  plugins: [
    react(),
    ...(existsSync('power.config.json') ? [powerApps()] : []),
  ],
})
