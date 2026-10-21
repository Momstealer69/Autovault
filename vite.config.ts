import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { rollupOptions: { output: { manualChunks(id) {
    if (!id.includes('node_modules')) return
    if (id.includes('@supabase')) return 'supabase'
    if (id.includes('lucide-react')) return 'icons'
    if (id.includes('react-router')) return 'router'
    if (id.includes('react-dom') || /\\react\\/.test(id)) return 'react'
    return 'vendor'
  } } } }
})
