// vite/src/features/hud/index.tsx
import React from "react";
import { GameFeature } from "@/core/types/architecture";
import { UIOverlay } from "./ui/UIOverlay";
import { AlertSystem } from "./ui/AlertSystem";

export const hudFeature: GameFeature = {
  key: "hud",
  renderUI: (slot) => {
    if (slot === "ui-overlay") {
      return (
        <>
          <UIOverlay />
          {/* アラートシステムは最前面に表示 */}
          <AlertSystem />
        </>
      );
    }
    return null;
  },
};
