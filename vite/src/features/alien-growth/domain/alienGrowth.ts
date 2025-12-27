import {
	GameState,
	ActiveAlienInstance,
	AlienCard,
} from "@/shared/types/game-schema";
import cardMasterData from "@/data/cardMasterData";

/**
 * 外来種成長フェーズの実行 (runAlienGrowthPhase)
 * ActionRegistry に適合させるためのラッパー関数です。
 * 盤面上のすべての外来種に対して成長判定を行います。
 */
export const runAlienGrowthPhase = (state: GameState, _payload?: any): GameState => {
	Object.values(state.activeAlienInstances).forEach((alien) => {
		// マスタデータからカード定義を取得
		const cardDef = cardMasterData.find((c) => c.id === alien.cardDefinitionId) as AlienCard;

		// 定義が存在し、かつ外来種カードであれば成長ロジックを適用
		if (cardDef && cardDef.cardType === "alien") {
			applyGrowthLogic(alien, cardDef);
		}
	});

	return state;
};

/**
 * 外来種の成長ロジック (alienGrowth)
 * * 【動機】
 * 配置された植物が時間の経過とともに強力になっていく「成長」の仕組みを実装するためです。
 * `cardMasterData` に定義された条件（待機ターンなど）に応じて、
 * 浸食範囲やパワーを動的にアップグレードします。
 *
 * 【恩恵】
 * - 単純な「配置して終わり」のゲームから、時間の経過を考慮した戦略的なゲームへと深化させます。
 * - 成長条件（条件タイプ、値）と効果（パワー、形状）を分離して定義できるため、
 * 多様な成長パターン（急成長、晩成型など）をデータ駆動で追加できます。
 *
 * 【注意】
 * - Phase 2 の改修により、本機能は一時的に停止されています。
 */
export const applyGrowthLogic = (
	alien: ActiveAlienInstance,
	cardDef: AlienCard,
) => {
	// 成長能力を持たない場合はスキップ
	if (!cardDef.canGrow || !cardDef.growthConditions || !cardDef.growthEffects)
		return;

	const currentStage = alien.currentGrowthStage;
	const nextCondition = cardDef.growthConditions[currentStage];
	const nextEffect = cardDef.growthEffects[currentStage];

	// これ以上の成長段階がない場合は終了
	if (!nextCondition || !nextEffect) return;

	let conditionMet = false;

	// 条件判定（現在はターンの経過数のみサポート）
	if (nextCondition.type === "turns_since_last_action") {
		if (alien.turnsSinceLastAction >= nextCondition.value) {
			conditionMet = true;
		}
	}

	// 条件を満たした場合、ステータスを更新（進化）
	if (conditionMet) {
		if (nextEffect.newInvasionPower)
			alien.currentInvasionPower = nextEffect.newInvasionPower;
		if (nextEffect.newInvasionShape)
			alien.currentInvasionShape = nextEffect.newInvasionShape;

		// ステージを上げ、経過カウンタをリセット
		alien.currentGrowthStage += 1;
		alien.turnsSinceLastAction = 0;
	}
};