import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    // Proxy API requests to the Flask backend
    // so we can use "/api/..." in our fetch calls
    proxy: {
      '/api': 'http://localhost:5002'
    }
  }
})
