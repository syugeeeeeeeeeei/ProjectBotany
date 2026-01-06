// vite/src/features/debug-console/index.tsx
import { GameFeature } from "@/core/types/architecture";
import { OnScreenConsole } from "./ui/OnScreenConsole";

/**
 * Debug Console Feature
 * 開発用ログを画面上にオーバーレイ表示する機能。
 * 本番ビルドや不要な場合はRegistryから外すだけで無効化できる。
 */
export const debugConsoleFeature: GameFeature = {
  key: "debug-console",

  // 初期化ロジックは特に必要ない（コンポーネントのマウント時にフックするため）
  // 必要であればここでGlobal変数の設定などを行う
  init: () => {
    console.log("[Feature] Debug Console Initialized");
    return () => {};
  },

  renderUI: (slot) => {
    if (slot === "ui-overlay") {
      return <OnScreenConsole />;
    }
    return null;
  },
};
