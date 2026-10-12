import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths: the app uses hash routing, so the build works under
  // any subpath, e.g. GitHub Pages at /ontrack2-trainer/.
  base: './',
  plugins: [react()],
})
