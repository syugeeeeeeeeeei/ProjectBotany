// vite/src/features/play-card/index.tsx
import { GameFeature } from "@/core/types/architecture";

export const playCardFeature: GameFeature = {
  key: "play-card",
  // init: 不要 (UI操作トリガーのため)

  // 現状UIコンポーネントが無いためnullを返す
  renderUI: () => null,
};