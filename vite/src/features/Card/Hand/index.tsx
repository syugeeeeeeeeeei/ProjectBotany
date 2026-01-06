// vite/src/features/card-hand/index.tsx
import React from "react";
import { GameFeature } from "@/core/types/architecture";
import Hand3D from "./ui/Hand3D";

export const cardHandFeature: GameFeature = {
  key: "card-hand",
  renderUI: (slot) => {
    if (slot === "main-3d") {
      // Feature内部でPropsを型安全に渡す
      return (
        <>
          <Hand3D player="alien" />
          <Hand3D player="native" />
        </>
      );
    }
    return null;
  },
};
