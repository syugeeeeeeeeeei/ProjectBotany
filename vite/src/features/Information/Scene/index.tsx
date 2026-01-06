import { GameFeature } from "@/core/types/architecture";
import { SceneManager } from "./ui/SceneManager";

export const sceneFeature: GameFeature = {
  key: "info-scene",
  renderUI: (slot) => {
    if (slot === "ui-overlay") {
      return <SceneManager />;
    }
    return null;
  },
};
