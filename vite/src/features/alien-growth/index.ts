// vite/src/features/alien-growth/index.ts
import { initAlienGrowth } from "./logic";

export const alienGrowthFeature = {
	key: "alien-growth",
	init: initAlienGrowth,
};