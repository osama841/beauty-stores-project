import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // لو ما حددت قيمة في .env بيصير '/' تلقائيًا
  const base = env.VITE_BASE_PATH || '/'

  return {
    base,
    plugins: [react()],
  }
})