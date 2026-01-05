// vite/src/features/alien-expansion/index.ts
import { GameFeature } from "@/core/types/architecture";
import { initAlienExpansionLogic } from "./logic";

export const alienExpansionFeature: GameFeature = {
  key: "alien-expansion",
  init: initAlienExpansionLogic,
};