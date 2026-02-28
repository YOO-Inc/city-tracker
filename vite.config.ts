import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { readFileSync } from 'fs'

// Read version.json if it exists (will exist after prebuild)
let buildTime = new Date().toISOString(); // fallback for dev
try {
  const version = JSON.parse(readFileSync('public/version.json', 'utf-8'));
  buildTime = version.buildTime;
} catch {
  // version.json doesn't exist yet (first build or dev mode)
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
