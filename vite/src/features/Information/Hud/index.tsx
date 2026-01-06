import { GameFeature } from "@/core/types/architecture";
import { HudManager } from "./ui/HudManager";
export const hudFeature: GameFeature = {
  key: "info-hud",
  renderUI: (slot) => {
    if (slot === "ui-overlay") {
      return <HudManager />;
    }
    return null;
  },
};
