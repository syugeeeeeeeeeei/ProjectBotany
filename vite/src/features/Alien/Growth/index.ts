// vite/src/features/Alien/Growth/index.ts
import { GameFeature } from "@/core/types/architecture";
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { useGameStore } from "@/core/store/gameStore";
import { gameActions } from "@/core/api/actions";
import { processAlienGrowth } from "./logic";

export const alienGrowthFeature: GameFeature = {
	key: "alien-growth",

	init: () => {
		const handleRoundEnd = () => {
			// その時点での最新ステートを取得
			const currentState = useGameStore.getState();
			const nextState = processAlienGrowth(currentState);

			if (nextState !== currentState) {
				// 即座に Store へ反映（これにより RoundSystem が最新を参照できるようになる）
				gameActions.system.updateState(nextState);
			}
		};

		gameEventBus.on("ROUND_END", handleRoundEnd);
		return () => gameEventBus.off("ROUND_END", handleRoundEnd);
	},

	renderUI: () => null,
};