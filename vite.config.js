import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: true
    }
  },
  // Optimize for 3D applications
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei']
  }
})
