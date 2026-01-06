// vite/src/features/Alien/Growth/logic.ts
import { GameState } from "@/shared/types/game-schema";

/**
 * 外来種の成長処理
 * * 【修正後のロジック】
 * - ROUND_END イベント（ラウンド終了直前）で実行される。
 * - 判定条件を spawnedRound <= currentRound に変更。
 * - これにより、外来種がそのラウンドにまいた種は、在来種のターンを経た後のラウンド終了時に成長する。
 */
export const processAlienGrowth = (gameState: GameState): GameState => {
	const { alienInstances, currentRound } = gameState;
	const newAlienInstances = { ...alienInstances };
	let hasChanges = false;
	let grownCount = 0;

	console.group("[Feature: Alien Growth] Processing...");

	Object.values(newAlienInstances).forEach((instance) => {
		// 判定: 「種」であり、かつ「現在のラウンド以前に配置された」もの
		// これにより、R1に置かれた種は R1の終了時（ROUND_END）に成長します。
		if (instance.status === "seed" && instance.spawnedRound <= currentRound) {
			newAlienInstances[instance.instanceId] = {
				...instance,
				status: "plant",
			};
			hasChanges = true;
			grownCount++;

			console.log(`[Growth] 🌱 Seed (Spawned R${instance.spawnedRound}) matured at the end of Round ${currentRound}`);
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