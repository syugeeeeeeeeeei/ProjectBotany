// vite/src/features/turn-system/index.tsx
import React from "react";
import { GameFeature } from "@/core/types/architecture";
import TurnEndButton from "./ui/TurnEndButton";

export const turnSystemFeature: GameFeature = {
  key: "turn-system",
  renderUI: (slot) => {
    if (slot === "ui-overlay") {
      return <TurnEndButton />;
    }
    return null;
  },
};