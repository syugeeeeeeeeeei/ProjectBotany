import { ActiveAlienInstance, AlienCard } from "@/shared/types/game-schema";

/**
 * 外来種の成長ロジック (alienGrowth)
 * 
 * 【動機】
 * 配置された植物が時間の経過とともに強力になっていく「成長」の仕組みを実装するためです。
 * `cardMasterData` に定義された条件（待機ターンなど）に応じて、
 * 浸食範囲やパワーを動的にアップグレードします。
 *
 * 【恩恵】
 * - 単純な「配置して終わり」のゲームから、時間の経過を考慮した戦略的なゲームへと深化させます。
 * - 成長条件（条件タイプ、値）と効果（パワー、形状）を分離して定義できるため、
 *   多様な成長パターン（急成長、晩成型など）をデータ駆動で追加できます。
 *
 * 【使用法】
 * `alienExpansion.ts` 内での活性化ループ中に各個体に対して呼び出されます。
 */
/**
 * 特定の外来種インスタンスに対して成長ロジックを適用する
 * ターン経過によるパワーアップや形状の変化を実行するために必要です。
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
