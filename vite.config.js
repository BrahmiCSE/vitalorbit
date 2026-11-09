import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// "@" lets you import from src without ../../ chains:
//   import GlassCard from '@/components/ui/GlassCard'
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
})
