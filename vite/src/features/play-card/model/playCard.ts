import { produce } from "immer";
import { nanoid } from "nanoid";
import {
	createAlienCoreCell,
	createEmptyAreaCell,
	createNativeAreaCell,
	createRecoveryPendingAreaCell,
} from "../../../entities/field/model/fieldLogic";
import type {
	CardDefinition,
	CellState,
	FieldState,
	GameState
} from "../../../shared/types/data";

/**
 * カードの効果範囲を計算する。
 * UIプレビューおよび活性フェーズの侵略計算の両方で使用される共通ロジック。
 */
export const getEffectRange = (
	card: CardDefinition,
	targetCell: CellState,
	field: FieldState,
	facingFactor: 1 | -1,
): CellState[] => {
	const { width, height, cells } = field;
	const { x: cx, y: cy } = targetCell;
	const coords: { x: number; y: number }[] = [];

	if ("target" in card.targeting && card.targeting.target === "species") {
		const dominantId =
			(targetCell.cellType === "alien_core" && targetCell.alienInstanceId) ||
			(targetCell.cellType === "alien_invasion_area" && targetCell.dominantAlienInstanceId);

		if (dominantId) {
			cells.flat().forEach(cell => {
				if ((cell.cellType === "alien_core" && cell.alienInstanceId === dominantId) ||
					(cell.cellType === "alien_invasion_area" && cell.dominantAlienInstanceId === dominantId)) {
					coords.push({ x: cell.x, y: cell.y });
				}
			});
		} else {
			coords.push({ x: cx, y: cy });
		}
	} else {
		if (!("shape" in card.targeting)) return [];
		const { power, shape } = card.targeting;
		switch (shape) {
			case "single":
				coords.push({ x: cx, y: cy });
				break;
			case "cross":
				coords.push({ x: cx, y: cy });
				for (let i = 1; i <= power; i++) {
					coords.push({ x: cx, y: cy + i }, { x: cx, y: cy - i }, { x: cx + i, y: cy }, { x: cx - i, y: cy });
				}
				break;
			case "range":
				for (let y = cy - (power - 1); y <= cy + (power - 1); y++) {
					for (let x = cx - (power - 1); x <= cx + (power - 1); x++) {
						coords.push({ x, y });
					}
				}
				break;
			case "straight":
				{
					const { direction } = card.targeting;
					const directions = {
						up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
						vertical: [0, 1, 0, -1], horizon: [1, 0, -1, 0]
					};
					const move = directions[direction];
					const yMultiplier = (direction === 'up' || direction === 'down' || direction === 'vertical') ? facingFactor : 1;
					for (let i = 1; i <= power; i++) {
						for (let j = 0; j < move.length; j += 2) {
							coords.push({ x: cx + move[j] * i, y: cy + move[j + 1] * i * yMultiplier });
						}
					}
					break;
				}
		}
	}

	return coords
		.filter(c => c.x >= 0 && c.x < width && c.y >= 0 && c.y < height)
		.map(c => cells[c.y][c.x]);
};

/**
 * カードの使用を試みるメインロジック
 */
export const playCardLogic = (
	state: GameState,
	card: CardDefinition,
	targetCell: CellState,
): GameState | string => {
	const { activePlayerId } = state;
	const currentPlayer = state.playerStates[activePlayerId];

	if (currentPlayer.currentEnvironment < card.cost) return "エンバイロメントが足りません！";
	if (card.cardType === "alien" && (targetCell.cellType === "empty_area" || targetCell.cellType === "recovery_pending_area" || targetCell.cellType === "alien_core")) return "このマスには配置できません";
	if (card.cardType === "recovery" && !("target" in card.targeting && card.targeting.target === "species") && (targetCell.cellType !== "empty_area" && targetCell.cellType !== "recovery_pending_area")) return "このマスは回復できません。";
	if (card.cardType === "eradication" && targetCell.cellType === "native_area") return "在来種マスは駆除対象にできません。";

	return produce(state, draft => {
		const newPlayerState = draft.playerStates[activePlayerId];
		const effectRange = getEffectRange(card, targetCell, draft.gameField, newPlayerState.facingFactor);

		switch (card.cardType) {
			case "alien":
				const newInstance = {
					instanceId: nanoid(),
					cardDefinitionId: card.id,
					spawnedTurn: state.currentTurn,
					currentX: targetCell.x,
					currentY: targetCell.y,
					currentGrowthStage: 0,
					currentInvasionPower: card.targeting.power,
					currentInvasionShape: card.targeting.shape,
					turnsSinceLastAction: 0,
				};
				draft.activeAlienInstances[newInstance.instanceId] = newInstance;
				draft.gameField.cells[targetCell.y][targetCell.x] = createAlienCoreCell(targetCell.x, targetCell.y, newInstance.instanceId);
				break;
			case "eradication":
				effectRange.forEach(target => {
					const cell = draft.gameField.cells[target.y][target.x];
					if (cell.cellType === "alien_core") delete draft.activeAlienInstances[cell.alienInstanceId];
					draft.gameField.cells[target.y][target.x] = card.postRemovalState === "empty_area"
						? createEmptyAreaCell(target.x, target.y)
						: createRecoveryPendingAreaCell(target.x, target.y, draft.currentTurn);
				});
				break;
			case "recovery":
				effectRange.forEach(target => {
					const cell = draft.gameField.cells[target.y][target.x];
					if (cell.cellType === "empty_area" || cell.cellType === "recovery_pending_area" || ("target" in card.targeting && card.targeting.target === "species")) {
						draft.gameField.cells[target.y][target.x] = card.postRecoveryState === "native_area"
							? createNativeAreaCell(target.x, target.y)
							: createRecoveryPendingAreaCell(target.x, target.y, draft.currentTurn);
					}
				});
				break;
		}

		newPlayerState.currentEnvironment -= card.cost;
		if (card.cooldownTurns) newPlayerState.cooldownActiveCards.push({ cardId: card.id, turnsRemaining: card.cooldownTurns });
		if (card.usageLimit) newPlayerState.limitedCardsUsedCount[card.id] = (newPlayerState.limitedCardsUsedCount[card.id] || 0) + 1;
	});
};