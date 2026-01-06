import { GameFeature } from "@/core/types/architecture";
import { BannerManager } from "./ui/BannerManager";

export const bannerFeature: GameFeature = {
  key: "info-banner",
  renderUI: (slot) => {
    if (slot === "ui-overlay") {
      return <BannerManager />;
    }
    return null;
  },
};
