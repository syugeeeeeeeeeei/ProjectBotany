import { GameFeature, defineFeatureComponent } from "@/core/types/architecture";
import GameBoard3D from "./ui/GameBoard3D";

export const fieldGridFeature: GameFeature = {
  key: "field-grid",
  components: [
    defineFeatureComponent({
      id: "game-board-3d",
      slot: "main-3d",
      Component: GameBoard3D,
      // propsがない場合は省略可能
    }),
  ],
};