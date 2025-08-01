import { ALIEN_MOVE_COST, PLAYER_IDS } from "../constants/game";
import type { CellState, FieldState, GameState, GameStore, PlayerId } from "../types/data";
import {
	calculateAllInvasions,
	placeAlienCore,
	removeInstancesWithoutDominatedCells,
	updateAlienPosition,
} from "./fieldLogic";
import { createNewAlienInstance } from "./instanceLogic";
import {
	updatePlayerResourcesForNewTurn,
	updatePlayerStateAfterPlayingCard,
} from "./playerActions";

// checkWinConditionは変更なし
export const checkWinCondition = (
	gameField: FieldState
): { isGameOver: boolean; winningPlayerId: PlayerId | null } => {
	let nativeCellCount = 0;
	let alienCellCount = 0;

	for (const row of gameField.cells) {
		for (const cell of row) {
			if (cell.ownerId === "native_side") {
				nativeCellCount++;
			} else if (cell.ownerId === "alien_side") {
				alienCellCount++;
			}
		}
	}

	if (nativeCellCount > 0 && alienCellCount === 0) {
		return { isGameOver: true, winningPlayerId: "native_side" };
	}
	if (alienCellCount > 0 && nativeCellCount === 0) {
		return { isGameOver: true, winningPlayerId: "alien_side" };
	}

	return { isGameOver: false, winningPlayerId: null };
};

/**
 * ターン進行に伴うゲーム状態の更新ロジック全体を処理します。
 */
export const processTurnProgression = (
	currentState: GameStore
): Partial<GameState> => {
	const {
		currentTurn,
		maximumTurns,
		activeAlienInstances,
		cardMasterData,
		gameField,
		playerStates,
		activePlayerId,
	} = currentState;

	if (currentTurn >= maximumTurns) {
		// TODO: 最終ターン終了時の勝敗判定
		return { isGameOver: true };
	}

	let finalCells: CellState[][] = JSON.parse(JSON.stringify(gameField.cells));
	let finalInstances = { ...activeAlienInstances };

	// ✨ --- 活性フェーズ ---
	if (activePlayerId === PLAYER_IDS.ALIEN_SIDE) {
		// 1-1. 成長 (TODO)

		// 1-2. 拡散
		const cellsAfterInvasion = calculateAllInvasions(
			finalCells,
			Object.values(finalInstances),
			cardMasterData,
			gameField.width,
			gameField.height
		);
		// 1-3. 支配マスを持たないコマの除去
		const removalResult = removeInstancesWithoutDominatedCells(
			cellsAfterInvasion,
			finalInstances
		);
		finalCells = removalResult.newCells;
		finalInstances = removalResult.newInstances;

	} else if (activePlayerId === PLAYER_IDS.NATIVE_SIDE) {
		// 2-1. 再生待機(黄) -> 在来種(緑)
		finalCells.forEach(row => row.forEach(cell => {
			if (cell.cellType === 'recovery_pending_area') {
				cell.cellType = 'native_area';
				cell.ownerId = PLAYER_IDS.NATIVE_SIDE;
			}
		}));
		// 2-2. 空(灰) -> 再生待機(黄)
		finalCells.forEach(row => row.forEach(cell => {
			if (cell.cellType === 'empty_area') {
				cell.cellType = 'recovery_pending_area';
			}
		}));
	}

	const newGameField = { ...gameField, cells: finalCells };

	const winCheckResult = checkWinCondition(newGameField);
	if (winCheckResult.isGameOver) {
		return winCheckResult;
	}

	// --- ターン終了処理 ---
	const isNewRound = activePlayerId === PLAYER_IDS.NATIVE_SIDE;
	const nextTurn = isNewRound ? currentTurn + 1 : currentTurn;

	const newPlayerStates = { ...playerStates };
	if (isNewRound) {
		for (const playerId in newPlayerStates) {
			let playerState = newPlayerStates[playerId as PlayerId];
			playerState = updatePlayerResourcesForNewTurn(playerState, nextTurn);
			newPlayerStates[playerId as PlayerId] = playerState;
		}
	}

	const nextPlayerId =
		activePlayerId === PLAYER_IDS.ALIEN_SIDE
			? PLAYER_IDS.NATIVE_SIDE
			: PLAYER_IDS.ALIEN_SIDE;

	return {
		currentTurn: nextTurn,
		gameField: newGameField,
		playerStates: newPlayerStates,
		activeAlienInstances: finalInstances,
		activePlayerId: nextPlayerId,
	};
};

/**
 * カードプレイに伴うゲーム状態の更新ロジック全体を処理します。
 */
export const processCardPlay = (
	currentState: GameStore,
	cardDefinitionId: string,
	x: number,
	y: number
): Partial<GameState> | null => {
	const {
		activePlayerId,
		playerStates,
		cardMasterData,
		currentTurn,
		gameField,
		activeAlienInstances,
	} = currentState;
	const playerState = playerStates[activePlayerId];

	const isPlayable = playerState.playableCardIds.includes(cardDefinitionId);
	const cardDef = cardMasterData[cardDefinitionId];
	if (!isPlayable || !cardDef) {
		console.error("Error: Card not found or not playable by this player.");
		return null;
	}
	const isCoolingDown = playerState.cooldownActiveCards.some(
		(c) => c.cardId === cardDef.id
	);
	if (isCoolingDown) {
		console.error(`Error: Card "${cardDef.name}" is on cooldown.`);
		return null;
	}
	if (playerState.currentEnvironment < cardDef.cost) {
		console.error(
			`Error: Not enough environment. Need ${cardDef.cost}, have ${playerState.currentEnvironment}.`
		);
		return null;
	}
	const targetCell = gameField.cells[y]?.[x];
	if (!targetCell) {
		console.error("Error: Invalid coordinates.");
		return null;
	}

	let updatedGameState: Partial<GameState> = {};

	if (cardDef.cardType === "alien") {
		const unplaceableTypes: CellState["cellType"][] = ["alien_core", "rock", "pond"];
		if (unplaceableTypes.includes(targetCell.cellType)) {
			console.error(`Error: Cannot place card on cell of type "${targetCell.cellType}".`);
			return null;
		}
		const newInstance = createNewAlienInstance(cardDef, activePlayerId, x, y, currentTurn);
		if (!newInstance) return null;

		updatedGameState.activeAlienInstances = { ...activeAlienInstances, [newInstance.instanceId]: newInstance };
		updatedGameState.gameField = placeAlienCore(gameField, newInstance);

	} else if (cardDef.cardType === "eradication") {
		if (targetCell.ownerId !== PLAYER_IDS.ALIEN_SIDE) {
			console.error("Error: Can only target alien-owned cells.");
			return null;
		}
		const newCells = JSON.parse(JSON.stringify(gameField.cells));
		const cellToUpdate = newCells[y][x];
		const newInstances = { ...activeAlienInstances };
		if (cellToUpdate.cellType === 'alien_core' && cellToUpdate.dominantAlienInstanceId) {
			delete newInstances[cellToUpdate.dominantAlienInstanceId];
		}
		cellToUpdate.cellType = 'empty_area'; // ✨ 要件通り空マスに
		cellToUpdate.ownerId = null;
		cellToUpdate.dominantAlienInstanceId = null;
		updatedGameState.gameField = { ...gameField, cells: newCells };
		updatedGameState.activeAlienInstances = newInstances;

	} else if (cardDef.cardType === "recovery") {
		const newCells = JSON.parse(JSON.stringify(gameField.cells));
		const cellToUpdate = newCells[y][x];
		cellToUpdate.cellType = 'native_area';
		cellToUpdate.ownerId = PLAYER_IDS.NATIVE_SIDE;
		cellToUpdate.dominantAlienInstanceId = null;
		updatedGameState.gameField = { ...gameField, cells: newCells };
	}

	const newPlayerState = updatePlayerStateAfterPlayingCard(playerState, cardDef);
	updatedGameState.playerStates = { ...playerStates, [activePlayerId]: newPlayerState };

	const finalFieldState = updatedGameState.gameField || gameField;
	const winCheckResult = checkWinCondition(finalFieldState);
	if (winCheckResult.isGameOver) {
		return { ...updatedGameState, ...winCheckResult };
	}

	return updatedGameState;
};

// processAlienMoveは変更なし
export const processAlienMove = (
	currentState: GameStore,
	instanceId: string,
	targetX: number,
	targetY: number
): Partial<GameState> | null => {
	const { activePlayerId, playerStates, activeAlienInstances, gameField } = currentState;
	const playerState = playerStates[activePlayerId];
	const instance = activeAlienInstances[instanceId];

	if (!instance || instance.ownerId !== activePlayerId) {
		console.error("Error: Instance not found or you are not the owner.");
		return null;
	}
	if (playerState.currentEnvironment < ALIEN_MOVE_COST) {
		console.error(`Error: Not enough environment for move. Need ${ALIEN_MOVE_COST}.`);
		return null;
	}

	const targetCell = gameField.cells[targetY]?.[targetX];
	if (!targetCell) {
		console.error("Error: Invalid target coordinates for move.");
		return null;
	}
	if (targetCell.dominantAlienInstanceId !== instanceId || targetCell.cellType === 'alien_core') {
		console.error("Error: Can only move to a cell dominated by the instance. Cannot move to a cell with another core.");
		return null;
	}

	const newPlayerState = {
		...playerState,
		currentEnvironment: playerState.currentEnvironment - ALIEN_MOVE_COST,
	};

	const newActiveAlienInstances = {
		...activeAlienInstances,
		[instanceId]: { ...instance, currentX: targetX, currentY: targetY },
	};

	const newFieldState = updateAlienPosition(gameField, instance, targetX, targetY);

	return {
		playerStates: {
			...currentState.playerStates,
			[activePlayerId]: newPlayerState,
		},
		activeAlienInstances: newActiveAlienInstances,
		gameField: newFieldState,
	};
};