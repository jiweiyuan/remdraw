import path from 'path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  define: {
    "process.env.IS_PREACT": JSON.stringify("true"),
  },
  worker:{
    format: 'es',
  }
});
