import { nanoid } from 'nanoid';
import { create } from 'zustand';
import type { ActiveAlienInstance, CardDefinition, CellState, FieldState, GameState, PlayerId, PlayerState } from '../types/data';

const cardMasterData: CardDefinition[] = [
	// 外来種カード (9枚)
	{ id: 'alien-1', name: 'ブラジルチドメクサ', description: '水路で繁殖する外来種。茎から増えるため、少ないコストで連鎖的に侵略できる。直線状に侵略する。', cost: 1, cardType: 'alien', imagePath: 'https://placehold.co/100x60', baseInvasionPower: 1, baseInvasionShape: 'straight', canGrow: false },
	{ id: 'alien-2', name: 'ナガミヒナゲシ', description: '繁殖力が高く、徐々に勢力を拡大する外来種。あまり警戒されていないことが脅威となる。十字状に侵略する。', cost: 1, cardType: 'alien', imagePath: 'https://placehold.co/100x60', baseInvasionPower: 1, baseInvasionShape: 'cross', canGrow: false },
	{ id: 'alien-3', name: 'オオキンケイギク', description: '繁殖・拡散速度が速い特定外来生物。召喚後2ターンで侵略力が上昇し、脅威度が増す。十字状に侵略する。', cost: 2, cardType: 'alien', imagePath: 'https://placehold.co/100x60', baseInvasionPower: 1, baseInvasionShape: 'cross', canGrow: true, growthConditions: [{ type: 'turns_since_last_action', value: 2 }], growthEffects: [{ type: 'increase_invasion_power', value: 1 }] },
	// { id: 'alien-4', name: 'ブラジルチドメクサ', description: '水路で繁殖する外来種。茎から増えるため、少ないコストで連鎖的に侵略できる。直線状に侵略する。', cost: 1, cardType: 'alien', imagePath: 'https://placehold.co/100x60', baseInvasionPower: 1, baseInvasionShape: 'straight', canGrow: false },
	// { id: 'alien-5', name: 'ナガミヒナゲシ', description: '繁殖力が高く、徐々に勢力を拡大する外来種。あまり警戒されていないことが脅威となる。十字状に侵略する。', cost: 1, cardType: 'alien', imagePath: 'https://placehold.co/100x60', baseInvasionPower: 1, baseInvasionShape: 'cross', canGrow: false },
	// { id: 'alien-6', name: 'オオキンケイギク', description: '繁殖・拡散速度が速い特定外来生物。召喚後2ターンで侵略力が上昇し、脅威度が増す。十字状に侵略する。', cost: 2, cardType: 'alien', imagePath: 'https://placehold.co/100x60', baseInvasionPower: 1, baseInvasionShape: 'cross', canGrow: true, growthConditions: [{ type: 'turns_since_last_action', value: 2 }], growthEffects: [{ type: 'increase_invasion_power', value: 1 }] },
	// { id: 'alien-7', name: 'ミズバショウ', description: '諏訪地域では外来種。大きな葉で広範囲の植物の生育面積を奪う。安易な駆除はできないため、戦略的な対応が求められる。範囲侵略を得意とする。', cost: 3, cardType: 'alien', imagePath: 'https://placehold.co/100x60', baseInvasionPower: 2, baseInvasionShape: 'range', canGrow: false },
	// { id: 'alien-8', name: 'オオハンゴンソウ', description: '低木と競合するほどの強い生命力を持つ特定外来生物。最初から高い侵略力を持つため、対処が遅れると危険。十字状に侵略する。', cost: 4, cardType: 'alien', imagePath: 'https://placehold.co/100x60', baseInvasionPower: 3, baseInvasionShape: 'cross', canGrow: false },
	// { id: 'alien-9', name: 'アレチウリ', description: '樹木などを覆い尽くす強力なつる性外来種。召喚後2ターンで侵略力が上昇し、広範囲に脅威を広げる。範囲侵略を得意とする。', cost: 5, cardType: 'alien', imagePath: 'https://placehold.co/100x60', baseInvasionPower: 1, baseInvasionShape: 'range', canGrow: true, growthConditions: [{ type: 'turns_since_last_action', value: 2 }], growthEffects: [{ type: 'increase_invasion_power', value: 1 }] },

	// 駆除カード (6枚)
	// { id: 'erad-1', name: '単一駆除剤', description: '指定した1マスを空マスにする。', cost: 1, cardType: 'eradication', imagePath: 'https://placehold.co/100x60', removalMethod: 'direct_n_cells', postRemovalState: 'empty_area', targetType: 'cell' },
	// { id: 'erad-2', name: '単一駆除剤', description: '指定した1マスを空マスにする。', cost: 1, cardType: 'eradication', imagePath: 'https://placehold.co/100x60', removalMethod: 'direct_n_cells', postRemovalState: 'empty_area', targetType: 'cell' },
	// { id: 'erad-3', name: '範囲駆除剤', description: '指定したマスを含む2x2マスを空マスにする。', cost: 3, cardType: 'eradication', imagePath: 'https://placehold.co/100x60', removalMethod: 'range_selection', postRemovalState: 'empty_area', targetType: 'cell' },
	// { id: 'erad-4', name: '範囲駆除剤', description: '指定したマスを含む2x2マスを空マスにする。', cost: 3, cardType: 'eradication', imagePath: 'https://placehold.co/100x60', removalMethod: 'range_selection', postRemovalState: 'empty_area', targetType: 'cell' },
	// { id: 'erad-5', name: '全体駆除作戦', description: '指定した外来種コマと、その支配マス全体を駆除する。', cost: 5, cardType: 'eradication', imagePath: 'https://placehold.co/100x60', removalMethod: 'target_alien_and_its_dominant_cells', targetType: 'alien_plant', usageLimit: 1 },
	// { id: 'erad-6', name: '全体駆除作戦', description: '指定した外来種コマと、その支配マス全体を駆除する。', cost: 5, cardType: 'eradication', imagePath: 'https://placehold.co/100x60', removalMethod: 'target_alien_and_its_dominant_cells', targetType: 'alien_plant', usageLimit: 1 },

	// 回復カード (6枚)
	{ id: 'recov-1', name: '単一回復剤', description: '指定した1マスを在来種マスに回復する。', cost: 1, cardType: 'recovery', imagePath: 'https://placehold.co/100x60', recoveryMethod: 'direct_n_cells' },
	{ id: 'recov-2', name: '単一回復剤', description: '指定した1マスを在来種マスに回復する。', cost: 1, cardType: 'recovery', imagePath: 'https://placehold.co/100x60', recoveryMethod: 'direct_n_cells' },
	{ id: 'recov-3', name: '範囲回復剤', description: '指定したマスを含む2x2マスを回復する。', cost: 3, cardType: 'recovery', imagePath: 'https://placehold.co/100x60', recoveryMethod: 'range_selection' },
	{ id: 'recov-4', name: '範囲回復剤', description: '指定したマスを含む2x2マスを回復する。', cost: 3, cardType: 'recovery', imagePath: 'https://placehold.co/100x60', recoveryMethod: 'range_selection' },
	{ id: 'recov-5', name: '緊急再生作戦', description: '広範囲の空マスを再生待機マスに変化させる。', cost: 4, cardType: 'recovery', imagePath: 'https://placehold.co/100x60', recoveryMethod: 'range_selection', usageLimit: 1 },
	{ id: 'recov-6', name: '緊急再生作戦', description: '広範囲の空マスを再生待機マスに変化させる。', cost: 4, cardType: 'recovery', imagePath: 'https://placehold.co/100x60', recoveryMethod: 'range_selection', usageLimit: 1 },
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
		console.log(`[progressTurn開始] アクティブプレイヤー: ${state.activePlayerId}, ターン: ${state.currentTurn}`);
		console.log(`[progressTurn開始] マス(${state.gameField.cells[5][3].x}, ${state.gameField.cells[5][3].y})のタイプ: ${state.gameField.cells[5][3].cellType}`);

		if (state.isGameOver) return state;

		let newCells = state.gameField.cells.map(row => row.map(cell => ({ ...cell })));
		const newActiveAlienInstances = { ...state.activeAlienInstances };
		const updatedPlayerStates = { ...state.playerStates };

		Object.values(updatedPlayerStates).forEach(p => {
			p.cooldownActiveCards = p.cooldownActiveCards.map(c => ({
				...c,
				turnsRemaining: c.turnsRemaining - 1
			})).filter(c => c.turnsRemaining > 0);
		});

		if (state.activePlayerId === 'alien_side') {
			const sortedAliens = Object.values(newActiveAlienInstances).sort((a, b) => {
				const costA = cardMasterData.find(c => c.id === a.cardDefinitionId)?.cost ?? 0;
				const costB = cardMasterData.find(c => c.id === b.cardDefinitionId)?.cost ?? 0;
				if (costA !== costB) {
					return costB - costA;
				}
				return b.spawnedTurn - a.spawnedTurn;
			});

			sortedAliens.forEach(alien => {
				const cardDef = cardMasterData.find(c => c.id === alien.cardDefinitionId);
				if (!cardDef) return;

				if (cardDef.canGrow && alien.currentGrowthStage < (cardDef.growthConditions?.length ?? 0)) {
					const condition = cardDef.growthConditions?.[alien.currentGrowthStage];
					if (condition?.type === 'turns_since_last_action' && (state.currentTurn - alien.spawnedTurn) >= condition.value) {
						const effect = cardDef.growthEffects?.[alien.currentGrowthStage];
						if (effect && effect.type === 'increase_invasion_power' && effect.value !== undefined) {
							alien.currentInvasionPower += effect.value;
							alien.currentGrowthStage++;
							console.log(`${cardDef.name} が成長！ 侵略力が ${alien.currentInvasionPower} になった！`);
						}
					}
				}

				const targets: { x: number; y: number }[] = [];
				const invasionPower = alien.currentInvasionPower;
				const { width, height } = state.gameField;

				switch (alien.currentInvasionShape) {
					case 'cross':
						for (let i = 1; i <= invasionPower; i++) {
							targets.push({ x: alien.currentX, y: alien.currentY + i });
							targets.push({ x: alien.currentX, y: alien.currentY - i });
							targets.push({ x: alien.currentX + i, y: alien.currentY });
							targets.push({ x: alien.currentX - i, y: alien.currentY });
						}
						break;
					case 'straight':
						for (let i = 1; i <= invasionPower; i++) {
							targets.push({ x: alien.currentX, y: alien.currentY + i });
							targets.push({ x: alien.currentX, y: alien.currentY - i });
						}
						break;
					case 'range':
						for (let y = alien.currentY - invasionPower; y <= alien.currentY + invasionPower; y++) {
							for (let x = alien.currentX - invasionPower; x <= alien.currentX + invasionPower; x++) {
								if (x === alien.currentX && y === alien.currentY) continue;
								targets.push({ x, y });
							}
						}
						break;
					case 'single':
						targets.push({ x: alien.currentX, y: alien.currentY + 1 });
						break;
				}

				targets.forEach(target => {
					if (target.y >= 0 && target.y < height && target.x >= 0 && target.x < width) {
						const cell = newCells[target.y][target.x];
						if (cell.cellType !== 'alien_core') {
							const currentDominantAlien = cell.dominantAlienInstanceId ? newActiveAlienInstances[cell.dominantAlienInstanceId] : null;
							const currentDominantCost = currentDominantAlien ? cardMasterData.find(c => c.id === currentDominantAlien.cardDefinitionId)?.cost ?? 0 : -1;
							const alienCost = cardDef.cost;

							if (!currentDominantAlien || alienCost > currentDominantCost || (alienCost === currentDominantCost && alien.spawnedTurn > currentDominantAlien.spawnedTurn)) {
								cell.cellType = 'alien_invasion_area';
								cell.ownerId = 'alien_side';
								cell.dominantAlienInstanceId = alien.instanceId;
								console.log(`[侵略成功] ターン${state.currentTurn}、コマ${alien.cardDefinitionId}がマス(${target.x}, ${target.y})を支配。`);
							} else {
								console.log(`[侵略失敗] ターン${state.currentTurn}、コマ${alien.cardDefinitionId}はマス(${target.x}, ${target.y})を支配できませんでした (より優先度の高いコマが既に支配)。`);
							}
						}
					}
				});
			});

			const dominantCounts: { [key: string]: number } = {};
			newCells.flat().forEach(cell => {
				if (cell.dominantAlienInstanceId) {
					dominantCounts[cell.dominantAlienInstanceId] = (dominantCounts[cell.dominantAlienInstanceId] || 0) + 1;
				}
			});

			Object.keys(newActiveAlienInstances).forEach(instanceId => {
				if (!dominantCounts[instanceId] || dominantCounts[instanceId] === 0) {
					console.log(`外来種コマ ${instanceId} (支配マス0) を除去`);
					delete newActiveAlienInstances[instanceId];
					newCells.flat().forEach(cell => {
						if (cell.alienInstanceId === instanceId) {
							cell.cellType = 'empty_area';
							cell.ownerId = null;
							cell.alienInstanceId = null;
							cell.dominantAlienInstanceId = null;
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

		console.log(`--- ターン${state.currentTurn}終了後の盤面状態（一部）---`);
		console.log(`マス(${newCells[5][3].x}, ${newCells[5][3].y})のタイプ: ${newCells[5][3].cellType}`);
		console.log(`マス(${newCells[5][3].x}, ${newCells[5][3].y})の支配者: ${newCells[5][3].dominantAlienInstanceId}`);
		if (newCells[6][3]) {
			console.log(`マス(${newCells[6][3].x}, ${newCells[6][3].y})のタイプ: ${newCells[6][3].cellType}`);
			console.log(`マス(${newCells[6][3].x}, ${newCells[6][3].y})の支配者: ${newCells[6][3].dominantAlienInstanceId}`);
		}
		console.log(`-------------------------------------------`);


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

	selectCard: (cardId) => set((state) => {
		const card = state.playerStates[state.activePlayerId].cooldownActiveCards.find(c => c.cardId === cardId?.split('-instance-')[0]);
		if (card) {
			get().setNotification(`このカードはあと${card.turnsRemaining}ターン使用できません。`, state.activePlayerId);
			return {};
		}

		return {
			selectedCardId: cardId,
			selectedAlienInstanceId: null
		};
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
		if (currentPlayer.cooldownActiveCards.some(c => c.cardId === cardId)) {
			get().setNotification("このカードはクールタイム中です。", activePlayerId);
			return;
		}
		if (currentPlayer.currentEnvironment < card.cost) {
			get().setNotification("エンバイロメントが足りません！", activePlayerId);
			return;
		}

		const newCells = gameField.cells.map(row => row.map(cell => ({ ...cell })));
		const newActiveAlienInstances = { ...activeAlienInstances };

		const targetsToUpdate: { x: number, y: number }[] = [];
		const { width, height } = state.gameField;

		switch (card.cardType) {
			case 'alien': {
				console.log(`[playCard] 外来種カード ${card.name} (${card.id}) をマス(${targetCell.x}, ${targetCell.y})にプレイ`);

				// ★追加: 配置できないマスを指定した場合のガード節
				if (targetCell.cellType === 'empty_area' || targetCell.cellType === 'recovery_pending_area') {
					get().setNotification("このマスには配置できません", activePlayerId);
					return;
				}
				if (targetCell.cellType === 'alien_core') {
					get().setNotification("他の外来種がいるマスには配置できません", activePlayerId);
					return;
				}


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
				const method = card.removalMethod;
				switch (method) {
					case 'direct_n_cells': {
						const cellToUpdate = newCells[targetCell.y][targetCell.x];
						targetsToUpdate.push(cellToUpdate);
						break;
					}
					case 'range_selection': {
						for (let y = targetCell.y; y < targetCell.y + 2; y++) {
							for (let x = targetCell.x; x < targetCell.x + 2; x++) {
								if (x >= 0 && x < width && y >= 0 && y < height) {
									targetsToUpdate.push(newCells[y][x]);
								}
							}
						}
						break;
					}
					case 'target_alien_and_its_dominant_cells': {
						const targetAlienInstance = newActiveAlienInstances[targetCell.alienInstanceId!];
						if (!targetAlienInstance) return;

						targetsToUpdate.push(...newCells.flat().filter(cell => cell.dominantAlienInstanceId === targetAlienInstance.instanceId));
						break;
					}
				}

				targetsToUpdate.forEach(target => {
					const cellToUpdate = newCells[target.y][target.x];
					if (cellToUpdate.alienInstanceId) {
						delete newActiveAlienInstances[cellToUpdate.alienInstanceId];
					}
					cellToUpdate.cellType = card.postRemovalState || 'empty_area';
					cellToUpdate.ownerId = null;
					cellToUpdate.alienInstanceId = null;
					cellToUpdate.dominantAlienInstanceId = null;
				});
				break;
			}
			case 'recovery': {
				const method = card.recoveryMethod;
				switch (method) {
					case 'direct_n_cells':
						if (targetCell.cellType === 'empty_area' || targetCell.cellType === 'recovery_pending_area') {
							targetsToUpdate.push(targetCell);
						} else {
							get().setNotification('このマスは回復できません。', activePlayerId);
							return;
						}
						break;
				}

				targetsToUpdate.forEach(target => {
					const cellToUpdate = newCells[target.y][target.x];
					cellToUpdate.cellType = 'native_area';
					cellToUpdate.ownerId = 'native_side';
				});
				break;
			}
		}

		if (card.cooldownTurns) {
			currentPlayer.cooldownActiveCards.push({
				cardId: cardId,
				turnsRemaining: card.cooldownTurns
			});
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

		const updatedState = get();
		console.log(`[playCard終了] プレイ後、マス(${targetCell.x}, ${targetCell.y})のタイプ: ${updatedState.gameField.cells[targetCell.y][targetCell.x].cellType}`);
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
