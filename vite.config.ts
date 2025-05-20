// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@supabase/supabase-js']
  },
  build: {
    rollupOptions: {
      external: ['@supabase/supabase-js']
    }
  }
})

