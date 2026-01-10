/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

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
    allowedHosts: [
      'projectbotany.app.fukaya-sus.lab'
    ],
    // ✨ watchオプションを追加してポーリングを有効化
    watch: {
      usePolling: true,
    },
    proxy: {
      // '/image-proxy' というパスへのリクエストをプロキシする設定
      '/plantnet.org': {
        // 転送先のドメイン
        target: 'https://bs.plantnet.org',
        // CORS制限を回避するために、リクエストのオリジンを転送先に偽装する
        changeOrigin: true,
        // パスから '/image-proxy' を削除してリクエストする
        rewrite: (path) => path.replace(/^\/plantnet.org/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Reactのコアライブラリ
          vendor: ['react', 'react-dom', 'zod', 'zustand', 'immer'],

          // ✨ 修正点: Three.js関連をさらに2つに分割して、1ファイルあたりのサイズを削減

          // 1. Three.js 本体 (重いので単独にする)
          'three-core': ['three'],

          // 2. R3F (React Three Fiber) 関連のユーティリティ
          'three-utils': ['@react-three/fiber', '@react-three/drei', '@react-spring/three'],
        },
      },
    },
    // 警告が出る閾値を設定 (1000kB = 1MB)
    // ※ 分割してもこれを超える場合は、1500などに上げても問題ありません（3Dアプリなので許容範囲です）
    chunkSizeWarningLimit: 1000,
  },
})
