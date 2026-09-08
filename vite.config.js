import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repo = 'economy-lab'
const base = process.env.GITHUB_PAGES === 'true' ? `/${repo}/` : '/'

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: 5173,
    host: true,
  },
})
