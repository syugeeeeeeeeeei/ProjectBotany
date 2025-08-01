import { v4 as uuidv4 } from "uuid";
import type {
	ActiveAlienInstance,
	CardDefinition,
	PlayerId,
} from "../types/data";

/**
 * 新しい外来種インスタンスを作成します。
 * @param cardDef - 配置するカードの定義
 * @param ownerId - インスタンスのオーナー
 * @param x - 配置先のX座標
 * @param y - 配置先のY座標
 * @param currentTurn - 現在のターン
 * @returns 新しいActiveAlienInstance
 */
export const createNewAlienInstance = (
	cardDef: CardDefinition,
	ownerId: PlayerId,
	x: number,
	y: number,
	currentTurn: number
): ActiveAlienInstance | null => {
	if (
		cardDef.cardType !== "alien" ||
		!cardDef.baseInvasionPower ||
		!cardDef.baseInvasionShape
	) {
		return null;
	}

	return {
		instanceId: uuidv4(),
		cardDefinitionId: cardDef.id,
		ownerId: ownerId,
		spawnedTurn: currentTurn,
		currentX: x,
		currentY: y,
		currentInvasionPower: cardDef.baseInvasionPower,
		currentInvasionShape: cardDef.baseInvasionShape,
		currentGrowthStage: 0,
		turnsSinceLastAction: 0,
	};
};