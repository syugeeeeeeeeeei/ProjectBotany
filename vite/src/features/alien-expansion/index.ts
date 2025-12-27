import { ActionRegistry } from "@/app/registry/ActionRegistry";
import { runAlienExpansionPhase } from "./domain/alienExpansion";

/**
 * 🌿 Alien Expansion Feature Init
 * 機能が有効化された時のみ呼び出され、ロジックをシステムに登録します。
 */
export const initAlienExpansion = () => {
	ActionRegistry.register("ALIEN_EXPANSION", runAlienExpansionPhase);
};

export * from "./domain/alienExpansion";