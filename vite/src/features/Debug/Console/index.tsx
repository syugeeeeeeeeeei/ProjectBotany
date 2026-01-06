// vite/src/features/debug-console/index.tsx
import { GameFeature } from "@/core/types/architecture";
import { DebugDashboard } from "./ui/DebugDashboard";

/**
 * Debug Dashboard Feature
 * デバッグ設定とコンソールを統合したダッシュボードを表示する機能。
 */
export const debugConsoleFeature: GameFeature = {
  key: "debug-console",

  init: () => {
    console.log("[Feature] Debug Dashboard Initialized");
    return () => {};
  },

  renderUI: (slot) => {
    if (slot === "ui-overlay") {
      /** ✨ コンソール単体ではなくダッシュボードを表示 */
      return <DebugDashboard />;
    }
    return null;
  },
};
