// vite/src/features/field-grid/index.tsx
import React from "react";
import { GameFeature } from "@/core/types/architecture";
import GameBoard3D from "./ui/GameBoard3D";

export const fieldGridFeature: GameFeature = {
  key: "field-grid",
  renderUI: (slot) => {
    if (slot === "main-3d") {
      return <GameBoard3D />;
    }
    return null;
  },
};
