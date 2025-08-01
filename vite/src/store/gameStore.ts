import { nanoid } from 'nanoid';
import { create } from 'zustand';
import type { ActiveAlienInstance, CardDefinition, CellState, FieldState, GameState, PlayerId, PlayerState } from '../types/data';

const cardMasterData: CardDefinition[] = [
	{ id: 'alien-1', name: 'オオキンケイギク', description: '召喚後2ターンで成長する。', cost: 2, cardType: 'alien', imagePath: '', baseInvasionPower: 1, baseInvasionShape: 'cross', canGrow: true, growthConditions: [{ type: 'turns_since_last_action', value: 2 }], growthEffects: [{ type: 'increase_invasion_power', value: 1 }] },
	{ id: 'erad-1', name: '強力駆除剤', description: '指定したマスを空マスにする。', cost: 1, cardType: 'eradication', imagePath: '' },
	{ id: 'recov-1', name: '緑の恵み', description: '空マスを在来種マスに回復する。', cost: 1, cardType: 'recovery', imagePath: '' },
	{ id: 'alien-2', name: 'セイタカアワダチソウ', description: 'コストが高いが強力。', cost: 4, cardType: 'alien', imagePath: '', baseInvasionPower: 2, baseInvasionShape: 'cross' },
	{ id: 'erad-2', name: '範囲駆除', description: '2x2マスを空マスにする。', cost: 3, cardType: 'eradication', imagePath: '' },
	{ id: 'alien-3', name: 'アメリカオニアザミ', description: '低コストで素早い侵略が可能。', cost: 1, cardType: 'alien', imagePath: '', baseInvasionPower: 1, baseInvasionShape: 'cross' },
];

interface GameStateWithSelection extends GameState {
	selectedCardId: string | null;
	selectedAlienInstanceId: string | null;
	notification: { message: string; forPlayer: PlayerId } | null;
}

interface GameActions {
	progressTurn: () => void;
	selectCard: (cardId: string | null) => void;
	playCard: (targetCell: CellState) => void;
	selectAlienInstance: (instanceId: string | null) => void;
	moveAlien: (targetCell: CellState) => void;
	setNotification: (message: string | null, forPlayer?: PlayerId) => void;
	resetGame: () => void;
}

const createInitialGameState = (): GameStateWithSelection => ({
	currentTurn: 1,
	maximumTurns: 8,
	activePlayerId: 'alien_side',
	currentPhase: 'summon_phase',
	isGameOver: false,
	winningPlayerId: null,
	gameField: createInitialFieldState(),
	playerStates: {
		// ★修正: プレイヤー名を変更
		native_side: createInitialPlayerState('native_side', '在来種'),
		alien_side: createInitialPlayerState('alien_side', '外来種'),
	},
	activeAlienInstances: {},
	selectedCardId: null,
	selectedAlienInstanceId: null,
	notification: null,
});

const createInitialPlayerState = (id: 'native_side' | 'alien_side', name: string): PlayerState => ({
	playerId: id,
	playerName: name,
	currentEnvironment: 1,
	maxEnvironment: 1,
	cardLibrary: [],
	cooldownActiveCards: [],
	limitedCardsUsedCount: {},
});

const createInitialFieldState = (): FieldState => {
	const width = 7;
	const height = 10;
	const cells = Array.from({ length: height }, (_, y) =>
		Array.from({ length: width }, (_, x): CellState => ({
			x,
			y,
			cellType: 'native_area',
			ownerId: 'native_side',
			alienInstanceId: null,
			dominantAlienInstanceId: null,
			recoveryPendingTurn: null,
		}))
	);
	return { width, height, cells };
};


export const useGameStore = create<GameStateWithSelection & GameActions>((set, get) => ({
	...createInitialGameState(),

	resetGame: () => set(createInitialGameState()),

	progressTurn: () => set((state) => {
		if (state.isGameOver) return state;

		let newCells = state.gameField.cells.map(row => row.map(cell => ({ ...cell })));
		const newActiveAlienInstances = { ...state.activeAlienInstances };

		if (state.activePlayerId === 'alien_side') {
			Object.values(newActiveAlienInstances).forEach(alien => {
				const cardDef = cardMasterData.find(c => c.id === alien.cardDefinitionId);
				if (cardDef?.canGrow && alien.currentGrowthStage < (cardDef.growthConditions?.length ?? 0)) {
					const condition = cardDef.growthConditions?.[alien.currentGrowthStage];
					if (condition?.type === 'turns_since_last_action' && (state.currentTurn - alien.spawnedTurn) >= condition.value) {
						const effect = cardDef.growthEffects?.[alien.currentGrowthStage];
						if (effect?.type === 'increase_invasion_power') {
							alien.currentInvasionPower += effect.value;
							alien.currentGrowthStage++;
							console.log(`${cardDef.name} が成長！ 侵略力が ${alien.currentInvasionPower} になった！`);
						}
					}
				}
				for (let i = 1; i <= alien.currentInvasionPower; i++) {
					const targets = [
						{ x: alien.currentX, y: alien.currentY + i },
						{ x: alien.currentX, y: alien.currentY - i },
						{ x: alien.currentX + i, y: alien.currentY },
						{ x: alien.currentX - i, y: alien.currentY },
					];
					targets.forEach(target => {
						if (target.y >= 0 && target.y < state.gameField.height && target.x >= 0 && target.x < state.gameField.width) {
							const cell = newCells[target.y][target.x];
							if (cell.cellType !== 'alien_core') {
								cell.cellType = 'alien_invasion_area';
								cell.ownerId = 'alien_side';
								cell.dominantAlienInstanceId = alien.instanceId;
							}
						}
					});
				}
			});
		} else {
			newCells.forEach(row => row.forEach(cell => {
				if (cell.cellType === 'recovery_pending_area') {
					cell.cellType = 'native_area';
					cell.ownerId = 'native_side';
				}
			}));
			newCells.forEach(row => row.forEach(cell => {
				if (cell.cellType === 'empty_area') cell.cellType = 'recovery_pending_area';
			}));
		}

		const nextPlayerId = state.activePlayerId === 'alien_side' ? 'native_side' : 'alien_side';
		let nextTurn = state.currentTurn;
		if (nextPlayerId === 'alien_side') nextTurn += 1;

		const updatedPlayerStates = { ...state.playerStates };
		Object.values(updatedPlayerStates).forEach(p => {
			p.maxEnvironment = nextTurn;
			p.currentEnvironment = nextTurn;
		});

		let isGameOver = nextTurn > state.maximumTurns;
		let winningPlayerId = state.winningPlayerId;
		if (isGameOver && !state.isGameOver) {
			const nativeScore = newCells.flat().filter(c => c.ownerId === 'native_side').length;
			const alienScore = newCells.flat().filter(c => c.ownerId === 'alien_side').length;
			console.log(`ゲーム終了！ 在来種: ${nativeScore}, 外来種: ${alienScore}`);
			if (nativeScore > alienScore) winningPlayerId = 'native_side';
			else if (alienScore > nativeScore) winningPlayerId = 'alien_side';
			else winningPlayerId = null;
		}

		return {
			currentTurn: nextTurn,
			activePlayerId: nextPlayerId,
			playerStates: updatedPlayerStates,
			isGameOver,
			winningPlayerId,
			selectedCardId: null,
			selectedAlienInstanceId: null,
			gameField: { ...state.gameField, cells: newCells },
			activeAlienInstances: newActiveAlienInstances
		};
	}),

	selectCard: (cardId) => set({
		selectedCardId: cardId,
		selectedAlienInstanceId: null
	}),

	playCard: (targetCell) => {
		const state = get();
		const { selectedCardId, activePlayerId, playerStates, gameField, activeAlienInstances } = state;
		if (!selectedCardId) return;

		const cardId = selectedCardId.split('-instance-')[0];
		const card = cardMasterData.find(c => c.id === cardId);
		if (!card) return;

		if (activePlayerId === 'alien_side' && card.cardType !== 'alien') {
			get().setNotification("外来種カードしか使用できません", activePlayerId);
			return;
		}
		if (activePlayerId === 'native_side' && card.cardType === 'alien') {
			get().setNotification("外来種カードは使用できません", activePlayerId);
			return;
		}

		const currentPlayer = playerStates[activePlayerId];
		if (currentPlayer.currentEnvironment < card.cost) {
			get().setNotification("エンバイロメントが足りません！", activePlayerId);
			return;
		}

		const newCells = gameField.cells.map(row => row.map(cell => ({ ...cell })));
		const newActiveAlienInstances = { ...activeAlienInstances };

		switch (card.cardType) {
			case 'alien': {
				const newAlienInstance: ActiveAlienInstance = {
					instanceId: nanoid(),
					cardDefinitionId: card.id,
					spawnedTurn: state.currentTurn,
					currentX: targetCell.x,
					currentY: targetCell.y,
					currentGrowthStage: 0,
					currentInvasionPower: card.baseInvasionPower ?? 1,
					currentInvasionShape: card.baseInvasionShape ?? 'single',
					turnsSinceLastAction: 0
				};
				newActiveAlienInstances[newAlienInstance.instanceId] = newAlienInstance;

				const cellToUpdate = newCells[targetCell.y][targetCell.x];
				cellToUpdate.cellType = 'alien_core';
				cellToUpdate.ownerId = 'alien_side';
				cellToUpdate.alienInstanceId = newAlienInstance.instanceId;
				cellToUpdate.dominantAlienInstanceId = newAlienInstance.instanceId;
				break;
			}
			case 'eradication': {
				const cellToUpdate = newCells[targetCell.y][targetCell.x];
				if (cellToUpdate.alienInstanceId) {
					delete newActiveAlienInstances[cellToUpdate.alienInstanceId];
				}
				cellToUpdate.cellType = 'empty_area';
				cellToUpdate.ownerId = null;
				cellToUpdate.alienInstanceId = null;
				cellToUpdate.dominantAlienInstanceId = null;
				break;
			}
			case 'recovery': {
				const cellToUpdate = newCells[targetCell.y][targetCell.x];
				if (cellToUpdate.cellType === 'empty_area') {
					cellToUpdate.cellType = 'native_area';
					cellToUpdate.ownerId = 'native_side';
				} else {
					get().setNotification('このマスは回復できません。', activePlayerId);
					return;
				}
				break;
			}
		}

		set({
			playerStates: {
				...playerStates,
				[activePlayerId]: {
					...currentPlayer,
					currentEnvironment: currentPlayer.currentEnvironment - card.cost
				}
			},
			gameField: { ...gameField, cells: newCells },
			activeAlienInstances: newActiveAlienInstances,
			selectedCardId: null
		});
	},

	selectAlienInstance: (instanceId) => set((state) => {
		if (state.activePlayerId !== 'alien_side') {
			get().setNotification("外来種サイドのターンではありません。", 'alien_side');
			return {};
		}
		if (state.selectedAlienInstanceId === instanceId) {
			return { selectedAlienInstanceId: null };
		}
		return {
			selectedCardId: null,
			selectedAlienInstanceId: instanceId
		};
	}),

	moveAlien: (targetCell) => {
		const state = get();
		const { selectedAlienInstanceId, activePlayerId, playerStates, activeAlienInstances, gameField } = state;
		if (!selectedAlienInstanceId) return;

		const alien = activeAlienInstances[selectedAlienInstanceId];
		if (!alien) return;

		const originalCard = cardMasterData.find(c => c.id === alien.cardDefinitionId);
		if (!originalCard) return;

		const moveCost = originalCard.cost;
		const currentPlayer = playerStates[activePlayerId];
		if (currentPlayer.currentEnvironment < moveCost) {
			get().setNotification("移動のためのエンバイロメントが足りません！", activePlayerId);
			return;
		}

		if (targetCell.cellType !== 'alien_invasion_area' || targetCell.dominantAlienInstanceId !== alien.instanceId) {
			get().setNotification("自身の侵略マスにしか移動できません", activePlayerId);
			return;
		}

		const newCells = gameField.cells.map(row => row.map(cell => ({ ...cell })));
		const newActiveAlienInstances = { ...activeAlienInstances };

		const originalCell = newCells[alien.currentY][alien.currentX];
		originalCell.cellType = 'alien_invasion_area';
		originalCell.alienInstanceId = null;

		const newCell = newCells[targetCell.y][targetCell.x];
		newCell.cellType = 'alien_core';
		newCell.ownerId = 'alien_side';
		newCell.alienInstanceId = alien.instanceId;
		newCell.dominantAlienInstanceId = alien.instanceId;

		const updatedAlien = { ...alien, currentX: targetCell.x, currentY: targetCell.y };
		newActiveAlienInstances[alien.instanceId] = updatedAlien;

		set({
			playerStates: {
				...playerStates,
				[activePlayerId]: {
					...currentPlayer,
					currentEnvironment: currentPlayer.currentEnvironment - moveCost
				}
			},
			gameField: { ...gameField, cells: newCells },
			activeAlienInstances: newActiveAlienInstances,
			selectedAlienInstanceId: null
		});
	},
	setNotification: (message, forPlayer) => {
		if (message && forPlayer) {
			set({ notification: { message, forPlayer } });
		} else {
			set({ notification: null });
		}
	},
}));

export { cardMasterData };
