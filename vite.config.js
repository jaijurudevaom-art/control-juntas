import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('docx') || id.includes('jszip') || id.includes('file-saver')) return 'vendor-docx'
            if (id.includes('@supabase')) return 'vendor-supabase'
            if (id.includes('react')) return 'vendor-react'
            return 'vendor-misc'
          }
        },
      },
    },
  },
})
