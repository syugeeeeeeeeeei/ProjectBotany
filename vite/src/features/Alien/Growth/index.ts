// vite/src/features/alien-growth/index.ts
import { GameFeature } from "@/core/types/architecture";
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { useGameStore } from "@/core/store/gameStore";
import { gameActions } from "@/core/api/actions";
import { processAlienGrowth } from "./logic";

export const alienGrowthFeature: GameFeature = {
	key: "alien-growth",

	init: () => {
		// ROUND_START (新しいラウンドが始まった直後) に成長を実行
		const handleRoundStart = () => {
			const currentState = useGameStore.getState();
			// 内部ロジックで spawnedRound < currentRound のものを成長させる
			const nextState = processAlienGrowth(currentState);

			if (nextState !== currentState) {
				gameActions.system.updateState(nextState);
			}
		};

		gameEventBus.on("ROUND_START", handleRoundStart);
		return () => gameEventBus.off("ROUND_START", handleRoundStart);
	},

	renderUI: () => null,
};