// vite/src/features/alien-growth/logic.ts

import { GameState } from "@/shared/types/game-schema";

/**
 * 外来種の成長処理 (Establishment)
 *
 * 【仕様】
 * - ラウンド終了時に実行される
 * - 盤面に存在する「種 (Seed)」のうち、「休眠期間」を終えたものを「成体 (Plant)」に変化させる
 * - 休眠期間: 配置されたラウンド中は成長しない (spawnedRound < currentRound の場合に成長)
 */
export const processAlienGrowth = (gameState: GameState): GameState => {
	const { alienInstances, currentRound } = gameState;
	const newAlienInstances = { ...alienInstances };
	let hasChanges = false;
	let grownCount = 0;

	console.group("[Feature: Alien Growth] Processing...");

	Object.values(newAlienInstances).forEach((instance) => {
		// 判定対象: 「種」の状態であり、かつ配置ラウンドが現在のラウンドより前（休眠明け）
		if (instance.status === "seed") {
			if (instance.spawnedRound < currentRound) {
				// 成体へ変化
				newAlienInstances[instance.instanceId] = {
					...instance,
					status: "plant",
				};
				hasChanges = true;
				grownCount++;

				console.log(`[Growth] 🌱 Seed at [${instance.currentX}, ${instance.currentY}] matured into Plant!`);
			} else {
				// まだ休眠中
				console.debug(`[Growth] 💤 Seed at [${instance.currentX}, ${instance.currentY}] is dormant (Spawned: R${instance.spawnedRound}).`);
			}
		}
	});

	if (!hasChanges) {
		console.log("[Growth] No seeds matured this round.");
		console.groupEnd();
		return gameState;
	}

	console.info(`[Growth] 🌳 Total ${grownCount} seeds matured into plants.`);
	console.groupEnd();

	return {
		...gameState,
		alienInstances: newAlienInstances,
	};
};