import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { loadPlugins } from "@/app/featuer-setting/pluginLoader";

// 🌿 論理設定に基づき、すべての機能を非同期でロード・初期化する
// トップレベル await を使用（Vite/モダンブラウザで動作）
await loadPlugins();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);