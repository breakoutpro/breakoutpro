import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Inject Gemini key at build time — reads from Vercel environment variable
    __GEMINI_KEY__: JSON.stringify(process.env.VITE_GEMINI_KEY || ''),
  },
})
