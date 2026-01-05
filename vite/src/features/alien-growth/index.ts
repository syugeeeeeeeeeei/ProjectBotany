// vite/src/features/alien-growth/index.ts
import { initAlienGrowthLogic } from "./logic";

export const alienGrowthFeature = {
	key: "alien-growth",
	init: initAlienGrowthLogic,
};