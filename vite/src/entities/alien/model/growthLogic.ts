import type { ActiveAlienInstance, AlienCard } from "../../../shared/types/data";

/**
 * 外来種の成長条件をチェックし、必要であればパラメータを更新する
 */
export const updateAlienGrowth = (alien: ActiveAlienInstance, cardDef: AlienCard): boolean => {
	if (!cardDef.canGrow || !cardDef.growthConditions || !cardDef.growthEffects) {
		return false;
	}

	const currentStage = alien.currentGrowthStage;
	const nextCondition = cardDef.growthConditions[currentStage];
	const nextEffect = cardDef.growthEffects[currentStage];

	if (!nextCondition || !nextEffect) {
		return false;
	}

	let conditionMet = false;
	if (nextCondition.type === 'turns_since_last_action') {
		if (alien.turnsSinceLastAction >= nextCondition.value) {
			conditionMet = true;
		}
	}

	if (conditionMet) {
		if (nextEffect.newInvasionPower) {
			alien.currentInvasionPower = nextEffect.newInvasionPower;
		}
		if (nextEffect.newInvasionShape) {
			alien.currentInvasionShape = nextEffect.newInvasionShape;
		}
		alien.currentGrowthStage += 1;
		alien.turnsSinceLastAction = 0;
		return true;
	}

	return false;
};