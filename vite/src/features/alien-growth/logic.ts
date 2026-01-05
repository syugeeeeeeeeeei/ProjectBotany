// vite/src/features/alien-growth/logic.ts
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { gameQuery } from "@/core/api";
import cardMasterData from "@/shared/data/cardMasterData";
import { AlienCard } from "@/shared/types/game-schema";

/**
 * initAlienGrowthLogic: 外来種成長ロジック
 * ラウンド終了時に条件を満たした外来種を強化する
 */
export const initAlienGrowthLogic = () => {
	const handler = () => {
		const state = gameQuery.state();

		state.internal_mutate((draft) => {
			// 存在する全ての外来種インスタンスに対して判定
			Object.values(draft.activeAlienInstances).forEach((alien) => {
				const cardDef = cardMasterData.find(
					(c) => c.id === alien.cardDefinitionId,
				) as AlienCard | undefined;

				if (!cardDef || !cardDef.canGrow || !cardDef.growthConditions) return;

				// 生存期間(ラウンド数)を加算
				alien.roundsSinceSpawn += 1;

				// 成長条件のチェック (現在は 'rounds_since_spawn' のみ対応)
				const shouldGrow = cardDef.growthConditions.some((condition) => {
					if (condition.type === "rounds_since_spawn") {
						// 例: 指定ラウンド数経過したら成長
						// 段階的な成長をサポートする場合、growthStageと照らし合わせるロジックが必要だが
						// ここでは単純に「条件値に達したら成長」とする
						return alien.roundsSinceSpawn >= condition.value;
					}
					return false;
				});

				if (shouldGrow) {
					// 成長適用 (最大ステージ制限などは要件によるが今回は1回のみ成長とする)
					if (alien.currentGrowthStage === 0 && cardDef.growthEffects) {
						const effect = cardDef.growthEffects[0]; // 最初の効果を適用
						if (effect) {
							if (effect.newInvasionPower) {
								alien.currentInvasionPower = effect.newInvasionPower;
							}
							if (effect.newInvasionShape) {
								alien.currentInvasionShape = effect.newInvasionShape;
							}
							alien.currentGrowthStage += 1;
						}
					}
				}
			});
		});
	};

	// ラウンド終了フェーズの開始直前に実行
	gameEventBus.on("BEFORE_ROUND_END", handler);

	return () => gameEventBus.off("BEFORE_ROUND_END", handler);
};