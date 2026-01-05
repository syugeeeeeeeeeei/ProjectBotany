// vite/src/features/play-card/index.ts
import { GameFeature } from "@/core/types/architecture";
import { initPlayCardLogic } from "./logic";

export const playCardFeature: GameFeature = {
  key: "play-card",
  init: initPlayCardLogic,
};