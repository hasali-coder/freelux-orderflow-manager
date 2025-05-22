// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // allow imports like "@/components/…" to map to "./src/components/…"
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
  },
  build: {
    rollupOptions: {
<<<<<<< HEAD
      external: ['@supabase/supabase-js']
    }
  }
=======
      external: [],
    },
  },
>>>>>>> eadf0e7 (🚀 Release: push to production)
})

