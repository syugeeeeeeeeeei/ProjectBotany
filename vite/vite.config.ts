/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    // ✨ HMR（ホットリロード）の設定を追加
    hmr: {
      port: 5173,
    },
    // ✨ watchオプションを追加してポーリングを有効化
    watch: {
      usePolling: true,
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom', // DOMをシミュレートする環境
    setupFiles: './src/setupTests.ts', // テスト実行前に読み込むファイル
  },
})
