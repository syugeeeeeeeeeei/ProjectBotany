import { ActionRegistry } from "@/app/registry/ActionRegistry";
import { runAlienGrowthPhase } from "./domain/alienGrowth";

/**
 * 🌿 Alien Growth Feature Init
 */
export const initAlienGrowth = () => {
	// runAlienGrowthPhase は (state) => state の型を持つため、登録可能
	ActionRegistry.register("ALIEN_GROWTH", runAlienGrowthPhase);
};

export * from "./domain/alienGrowth";