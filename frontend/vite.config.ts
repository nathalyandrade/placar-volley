import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Caminhos relativos: funciona servido pelo .NET ou em qualquer hospedagem estática (ex.: GitHub Pages)
  base: './',
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': 'http://localhost:5180',
    },
  },
  build: {
    // O backend .NET serve o frontend compilado
    outDir: '../backend/PlacarVolley.Api/wwwroot',
    emptyOutDir: true,
  },
})
