import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/case-management': path.resolve(__dirname, './src/case-management'),
      '@/time-control': path.resolve(__dirname, './src/time-control'),
      '@/task-management': path.resolve(__dirname, './src/task-management'),
      '@/notes-knowledge': path.resolve(__dirname, './src/notes-knowledge'),
      '@/disposicion-scripts': path.resolve(__dirname, './src/disposicion-scripts'),
      '@/archive-management': path.resolve(__dirname, './src/archive-management'),
      '@/user-management': path.resolve(__dirname, './src/user-management'),
      '@/dashboard-analytics': path.resolve(__dirname, './src/dashboard-analytics'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/stores': path.resolve(__dirname, './src/stores')
    },
  },
})
