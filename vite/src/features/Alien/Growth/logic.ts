// vite/src/features/alien-growth/logic.ts
import { GameState } from "@/shared/types/game-schema";

/**
 * 外来種の成長処理
 * * 【修正後のロジック】
 * - currentRound 未満の spawnedRound を持つ種のみを成長させる。
 * - 外来種ターン(R1)に置かれた種：
 * 在来種ターン終了時の ROUND_END 発火時点ではまだ currentRound は 1 のまま。
 * したがって、この判定では「次のラウンドの開始時」に成長させる必要がある。
 * * 猶予を「1手番分」にするため、RoundSystem側でラウンドを進める直前に判定を行います。
 */
export const processAlienGrowth = (gameState: GameState): GameState => {
	const { alienInstances, currentRound } = gameState;
	const newAlienInstances = { ...alienInstances };
	let hasChanges = false;
	let grownCount = 0;

	console.group("[Feature: Alien Growth] Processing...");

	Object.values(newAlienInstances).forEach((instance) => {
		// 判定: 「種」であり、かつ「現在のラウンドより前に配置された」もの
		// 在来種ターンの反撃で置かれた種(R1)は、R2の終了時まで成長しません。
		if (instance.status === "seed" && instance.spawnedRound < currentRound) {
			newAlienInstances[instance.instanceId] = {
				...instance,
				status: "plant",
			};
			hasChanges = true;
			grownCount++;

			console.log(`[Growth] 🌱 Seed (Spawned R${instance.spawnedRound}) matured at End of R${currentRound - 1}`);
		}
	});

	if (!hasChanges) {
		console.log("[Growth] No seeds matured in this timing.");
		console.groupEnd();
		return gameState;
	}

	console.info(`[Growth] 🌳 Total ${grownCount} seeds matured.`);
	console.groupEnd();

	return {
		...gameState,
		alienInstances: newAlienInstances,
	};
};