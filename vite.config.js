import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/Sino-StockMap/',
  build: {
    outDir: resolve(__dirname, 'outputs/dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // 確保打包出的檔名固定或便於識別
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
