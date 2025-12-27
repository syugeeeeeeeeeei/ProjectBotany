import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { loadPlugins } from "@/app/featuer-setting/pluginLoader";

/**
 * 🌿 Application Entry Point (main.tsx)
 * 
 * 【動機】
 * React アプリケーションの起動と、ゲーム独自のプラグインシステムの初期化を
 * 橋渡しするためです。レンダリングが始まる前に、必要な機能（Feature）を
 * 全てロードすることを保証します。
 *
 * 【恩恵】
 * - `loadPlugins()` を `await` することで、機能の登録漏れによる
 *   実行時エラー（レジストリが空であるなど）を完全に防ぐことができます。
 * - Vite のトップレベル await 機能を活用し、クリーンな非同期初期化フローを実現します。
 *
 * 【使用法】
 * ブラウザから直接読み込まれる、アプリケーションの正真正銘のエントリポイントです。
 */
// 1. 各機能（Feature）の初期化
// ActionRegistry や InteractionRegistry への登録を、レンダリング前に完了させるために必要です
await loadPlugins();

// 2. React アプリケーションのレンダリング開始
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);