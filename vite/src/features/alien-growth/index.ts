// vite/src/features/alien-growth/index.ts
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

			// 1. 最新のStateを取得
			const currentState = useGameStore.getState();

			// 2. ロジック実行
			const nextState = processAlienGrowth(currentState);

			// 3. 結果を適用
			if (nextState !== currentState) {
				gameActions.system.updateState(nextState);
			}
		};

		// シングルトンインスタンスで購読
		gameEventBus.on("ROUND_END", handleRoundEnd);

		// クリーンアップ
		return () => {
			gameEventBus.off("ROUND_END", handleRoundEnd);
		};
	},
};