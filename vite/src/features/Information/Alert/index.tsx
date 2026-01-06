import React from "react";
import { GameFeature } from "@/core/types/architecture";
import { AlertUI } from "./ui/AlertUI";

export const alertFeature: GameFeature = {
  key: "info-alert",
  renderUI: (slot) => {
    // 最前面に表示したいため、ui-overlayスロットを利用
    if (slot === "ui-overlay") {
      return <AlertUI />;
    }
    return null;
  },
};
