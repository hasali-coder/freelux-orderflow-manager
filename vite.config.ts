// vite.config.ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // so "@/foo/bar" maps to "<project-root>/src/foo/bar"
      "@": path.resolve(__dirname, "src"),
    },
    // you shouldn’t need extensions here—Vite will handle .ts/.tsx/.js/.jsx by default
  },
  server: {
    hmr: {
      overlay: false, // turn off that red-screen overlay
    },
  },
  optimizeDeps: {
    include: ["@supabase/supabase-js"],
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
})
