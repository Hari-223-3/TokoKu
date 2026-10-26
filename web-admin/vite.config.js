import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// GitHub Pages meng-host project di username.github.io/WebDevProject/ (bukan di root domain),
// jadi base harus sama persis dengan nama repo (huruf besar/kecil berpengaruh)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/WebDevProject/',
})
