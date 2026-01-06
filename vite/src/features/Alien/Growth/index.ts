// vite/src/features/alien-growth/index.tsx
import { GameFeature } from "@/core/types/architecture";
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { useGameStore } from "@/core/store/gameStore";
import { gameActions } from "@/core/api/actions";
import { processAlienGrowth } from "./logic";

export const alienGrowthFeature: GameFeature = {
	key: "alien-growth",

	init: () => {
		const handleRoundEnd = () => {
			console.log("🌱 [Feature: Alien Growth] Processing growth...");
			const currentState = useGameStore.getState();
			const nextState = processAlienGrowth(currentState);
			if (nextState !== currentState) {
				gameActions.system.updateState(nextState);
			}
		};

		gameEventBus.on("ROUND_END", handleRoundEnd);

		return () => {
			gameEventBus.off("ROUND_END", handleRoundEnd);
		};
	},

	renderUI: () => null,
};