import { GameFeature, defineFeatureComponent } from "@/core/types/architecture";
import TurnEndButton from "./ui/TurnEndButton";

export const turnSystemFeature: GameFeature = {
  key: "turn-system",
  components: [
    defineFeatureComponent({
      id: "turn-end-button",
      slot: "ui-overlay",
      Component: TurnEndButton,
    }),
  ],
};