import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ✅ FIX: Envoy monta il frontend su /group-5/
  //         Vite deve saperlo per generare i path degli asset correttamente
  base: '/group-5/',
})