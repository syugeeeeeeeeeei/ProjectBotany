import { ActiveAlienInstance, AlienCard } from "@/shared/types/game-schema";

/**
 * 外来種の成長条件を判定し、能力を更新する。
 */
export const applyGrowthLogic = (
  alien: ActiveAlienInstance,
  cardDef: AlienCard,
) => {
  if (!cardDef.canGrow || !cardDef.growthConditions || !cardDef.growthEffects)
    return;

  const currentStage = alien.currentGrowthStage;
  const nextCondition = cardDef.growthConditions[currentStage];
  const nextEffect = cardDef.growthEffects[currentStage];

  if (!nextCondition || !nextEffect) return;

  let conditionMet = false;
  if (nextCondition.type === "turns_since_last_action") {
    if (alien.turnsSinceLastAction >= nextCondition.value) {
      conditionMet = true;
    }
  }

  if (conditionMet) {
    if (nextEffect.newInvasionPower)
      alien.currentInvasionPower = nextEffect.newInvasionPower;
    if (nextEffect.newInvasionShape)
      alien.currentInvasionShape = nextEffect.newInvasionShape;
    alien.currentGrowthStage += 1;
    alien.turnsSinceLastAction = 0;
  }
};
