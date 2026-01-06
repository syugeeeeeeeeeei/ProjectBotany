// vite/src/features/turn-system/index.tsx
import React from "react";
import { GameFeature } from "@/core/types/architecture";
import TurnEndButton from "./ui/TurnEndButton";

export const turnSystemFeature: GameFeature = {
  key: "turn-system",

  // ロジックはCoreに移動したため、initは不要か、UIアニメーション等の管理のみに
  init: () => {
    return () => {};
  },

  renderUI: (slot) => {
    if (slot === "ui-overlay") {
      return <TurnEndButton />;
    }
    return null;
  },
};
