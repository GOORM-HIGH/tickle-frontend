import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Tailwind CSS가 항상 작동하도록 설정
  define: {
    __TAILWIND_ENABLED__: true
  }
})
