import { nanoid } from 'nanoid';
import cardMasterData from '../data/cardMasterData';
import type { ActiveAlienInstance, CardDefinition, CellState, FieldState, GameState, PlayerId } from '../types/data';

// --- 定数定義 ---
const GAME_SETTINGS = {
	FIELD_WIDTH: 7,
	FIELD_HEIGHT: 10,
	MAXIMUM_TURNS: 8,
};
/**
 * 外来種カードの侵略範囲を計算する（プレビュー用）
 * @param card - プレビュー対象のカード定義
 * @param targetCell - 配置予定の中心マス
 * @param field - 現在のフィールド状態
 * @returns 侵略予定のマスの配列
 */
const calculateInvasionPreview = (card: CardDefinition, targetCell: CellState, field: FieldState): CellState[] => {
	const invasionCoords: { x: number, y: number }[] = [];
	const { width, height, cells } = field;
	const { x: currentX, y: currentY } = targetCell;
	const invasionPower = card.baseInvasionPower ?? 1;
	const invasionShape = card.baseInvasionShape ?? 'single';

	// カードの侵略形状と侵略力に基づいて、影響を受ける座標を計算
	switch (invasionShape) {
		case 'cross':
			for (let i = 1; i <= invasionPower; i++) {
				invasionCoords.push({ x: currentX, y: currentY + i });
				invasionCoords.push({ x: currentX, y: currentY - i });
				invasionCoords.push({ x: currentX + i, y: currentY });
				invasionCoords.push({ x: currentX - i, y: currentY });
			}
			break;
		case 'range':
			for (let yOffset = -invasionPower; yOffset <= invasionPower; yOffset++) {
				for (let xOffset = -invasionPower; xOffset <= invasionPower; xOffset++) {
					if (xOffset === 0 && yOffset === 0) continue; // 中心マスは除く
					invasionCoords.push({ x: currentX + xOffset, y: currentY + yOffset });
				}
			}
			break;
		case 'straight':
			// 将来的な拡張用（例：一方向への侵略）
			for (let i = 1; i <= invasionPower; i++) {
				invasionCoords.push({ x: currentX, y: currentY + i });
			}
			break;
		case 'single':
			// 侵略範囲なし
			break;
	}

	// 計算した座標を、実際のCellStateオブジェクトに変換して返す
	return invasionCoords
		.filter(c => c.x >= 0 && c.x < width && c.y >= 0 && c.y < height)
		.map(c => cells[c.y][c.x]);
};

// --- 公開（エクスポート）するロジック関数 ---

/**
 * 外来種の移動を試みるロジック。
 * @param state - 現在のGameState
 * @param alienInstanceId - 移動する外来種のインスタンスID
 * @param targetCell - 移動先のマス
 * @returns 更新されたGameStateまたはエラーメッセージ
 */
export const moveAlienLogic = (
	state: GameState,
	alienInstanceId: string,
	targetCell: CellState
): GameState | string => {
	const alien = state.activeAlienInstances[alienInstanceId];
	if (!alien) {
		return "指定された外来種が見つかりません。";
	}

	const originalCard = cardMasterData.find(c => c.id === alien.cardDefinitionId);
	if (!originalCard) {
		return "外来種の元カード情報が見つかりません。";
	}

	const moveCost = originalCard.cost;
	const currentPlayer = state.playerStates[state.activePlayerId];

	// 1. コストチェック
	if (currentPlayer.currentEnvironment < moveCost) {
		return "移動のためのエンバイロメントが足りません！";
	}

	// 2. 移動ルールのチェック（自身の侵略マスにしか移動できない）
	if (targetCell.cellType !== 'alien_invasion_area' || targetCell.dominantAlienInstanceId !== alien.instanceId) {
		return "自身の侵略マスにしか移動できません";
	}

	// 3. 新しいStateをディープコピーして作成
	const newState = JSON.parse(JSON.stringify(state)) as GameState;
	const newAlien = newState.activeAlienInstances[alienInstanceId];
	const newPlayerState = newState.playerStates[newState.activePlayerId];

	// 4. 移動処理を実行
	// 元いたマスの外来種情報をクリア
	newState.gameField.cells[newAlien.currentY][newAlien.currentX].alienInstanceId = null;
	// 移動先のマスを新しいコアにする
	const newTargetCell = newState.gameField.cells[targetCell.y][targetCell.x];
	newTargetCell.cellType = 'alien_core';
	newTargetCell.alienInstanceId = newAlien.instanceId;

	// 外来種インスタンス自体の座標と状態を更新
	newAlien.currentX = targetCell.x;
	newAlien.currentY = targetCell.y;
	newAlien.turnsSinceLastAction = 0; // 移動はアクションと見なす

	// 5. コストを消費
	newPlayerState.currentEnvironment -= moveCost;

	return newState;
};


/**
 * カードの使用を試みるロジック。
 * 成功すれば更新されたGameStateを、失敗すればエラーメッセージを返す。
 * @param state - 現在のGameState
 * @param card - 使用するカードの定義
 * @param targetCell - 効果の対象となるマス
 * @returns 更新されたGameStateまたはエラーメッセージ
 */
export const playCardLogic = (
	state: GameState,
	card: CardDefinition,
	targetCell: CellState
): GameState | string => {
	const { activePlayerId } = state;
	const currentPlayer = state.playerStates[activePlayerId];

	// 1. コストが足りているかチェック
	if (currentPlayer.currentEnvironment < card.cost) {
		return "エンバイロメントが足りません！";
	}

	// 2. カードの種類に応じた配置・効果適用の可否をチェック
	switch (card.cardType) {
		case 'alien':
			// 配置できないマス（空、再生待機、他のコア）を指定した場合はエラー
			if (targetCell.cellType === 'empty_area' || targetCell.cellType === 'recovery_pending_area' || targetCell.cellType === 'alien_core') {
				return "このマスには配置できません";
			}
			break;
		case 'recovery':
			// 回復対象でないマスを指定した場合はエラー
			if (targetCell.cellType !== 'empty_area' && targetCell.cellType !== 'recovery_pending_area') {
				return 'このマスは回復できません。';
			}
			break;
		case 'eradication':
			// 駆除対象でないマスを指定した場合のエラー（例：在来種マスは駆除できないなど）
			if (targetCell.cellType === 'native_area') {
				return '在来種マスは駆除対象にできません。';
			}
			break;
	}

	// 3. 新しいStateをディープコピーして作成
	const newState = JSON.parse(JSON.stringify(state)) as GameState;
	const newPlayerState = newState.playerStates[activePlayerId];

	// 4. カード効果を適用
	switch (card.cardType) {
		case 'alien':
			applyAlienCard(newState, card, targetCell);
			break;
		case 'eradication':
			applyEradicationCard(newState, card, targetCell);
			break;
		case 'recovery':
			applyRecoveryCard(newState, card, targetCell);
			break;
	}

	// 5. [共通の後処理] コストを消費し、クールダウンと使用回数を記録
	newPlayerState.currentEnvironment -= card.cost;
	if (card.cooldownTurns) {
		newPlayerState.cooldownActiveCards.push({
			cardId: card.id,
			turnsRemaining: card.cooldownTurns,
		});
	}
	if (card.usageLimit) {
		newPlayerState.limitedCardsUsedCount[card.id] = (newPlayerState.limitedCardsUsedCount[card.id] || 0) + 1;
	}

	return newState;
};

/**
 * ターンを進行させるロジック。活性フェーズの処理とプレイヤー交代を行う。
 * @param state - 現在のGameState
 * @returns 更新されたGameState
 */
export const progressTurnLogic = (state: GameState): GameState => {
	// ゲーム終了後は何も処理しない
	if (state.isGameOver) {
		return state;
	}

	const newState = JSON.parse(JSON.stringify(state)) as GameState;

	// [活性フェーズ]
	if (newState.activePlayerId === 'alien_side') {
		runAlienActivationPhase(newState);
	} else {
		runNativeActivationPhase(newState);
	}

	// [ターン終了処理]
	// 1. 次のプレイヤーを決定
	const nextPlayerId = newState.activePlayerId === 'alien_side' ? 'native_side' : 'alien_side';
	// 2. 外来種サイドのターンが始まる時にターン数を進める
	const isNewTurnStarting = nextPlayerId === 'alien_side';
	const nextTurn = isNewTurnStarting ? newState.currentTurn + 1 : newState.currentTurn;

	// 3. 全プレイヤーのエンバイロメントを最大値まで回復・更新
	(Object.keys(newState.playerStates) as PlayerId[]).forEach(playerId => {
		const player = newState.playerStates[playerId];
		// 最初のターンは最大値が1から始まる
		const newMaxEnv = Math.max(1, nextTurn);
		player.maxEnvironment = newMaxEnv;
		player.currentEnvironment = newMaxEnv;
	});

	// 4. 全プレイヤーのクールダウン中のカードの残りターンを1減らす
	(Object.keys(newState.playerStates) as PlayerId[]).forEach(playerId => {
		const player = newState.playerStates[playerId];
		player.cooldownActiveCards = player.cooldownActiveCards
			.map(c => ({ ...c, turnsRemaining: c.turnsRemaining - 1 }))
			.filter(c => c.turnsRemaining > 0);
	});


	// [勝敗判定]
	const isGameOver = nextTurn > GAME_SETTINGS.MAXIMUM_TURNS;
	if (isGameOver && !newState.isGameOver) {
		const nativeScore = newState.gameField.cells.flat().filter(c => c.ownerId === 'native_side').length;
		const alienScore = newState.gameField.cells.flat().filter(c => c.ownerId === 'alien_side').length;
		if (nativeScore > alienScore) {
			newState.winningPlayerId = 'native_side';
		} else if (alienScore > nativeScore) {
			newState.winningPlayerId = 'alien_side';
		} else {
			newState.winningPlayerId = null; // 引き分け
		}
	}

	// [Stateの更新]
	newState.currentTurn = nextTurn;
	newState.activePlayerId = nextPlayerId;
	newState.isGameOver = isGameOver;

	return newState;
};

/**
 * カードの効果範囲を計算する。UIでのプレビュー表示と、実際の効果適用時の両方で使われる。
 * @param card - 効果を計算するカードの定義
 * @param targetCell - 効果の中心、または起点となるマス
 * @param field - 現在のフィールドの状態
 * @returns 効果が及ぶマスの配列
 */
export const getEffectRange = (card: CardDefinition, targetCell: CellState, field: FieldState): CellState[] => {
	// ★★★ 不具合修正箇所 ★★★
	// 外来種カードの場合は、侵略プレビュー範囲を計算して返す
	if (card.cardType === 'alien') {
		return calculateInvasionPreview(card, targetCell, field);
	}

	// 駆除・回復カードの場合のロジック
	const targets: CellState[] = [];
	const { width, height, cells } = field;
	const method = card.removalMethod || card.recoveryMethod;

	switch (method) {
		case 'direct_n_cells':
			targets.push(targetCell);
			break;
		case 'range_selection':
			// 将来的にカードマスタに範囲定義を持たせるのが望ましい
			for (let y = targetCell.y; y < targetCell.y + 2; y++) {
				for (let x = targetCell.x; x < targetCell.x + 2; x++) {
					if (x >= 0 && x < width && y >= 0 && y < height) {
						targets.push(cells[y][x]);
					}
				}
			}
			break;
		case 'target_alien_and_its_dominant_cells':
			const dominantId = targetCell.dominantAlienInstanceId;
			if (dominantId) {
				cells.flat().forEach(cell => {
					if (cell.dominantAlienInstanceId === dominantId) {
						targets.push(cell);
					}
				});
			} else if (targetCell.alienInstanceId) {
				targets.push(targetCell);
			}
			break;
		default:
			targets.push(targetCell);
	}
	return targets;
};

// --- 内部ヘルパー関数 ---

/** 外来種カードの効果を適用する */
const applyAlienCard = (state: GameState, card: CardDefinition, targetCell: CellState) => {
	const newAlienInstance: ActiveAlienInstance = {
		instanceId: nanoid(),
		cardDefinitionId: card.id,
		spawnedTurn: state.currentTurn,
		currentX: targetCell.x,
		currentY: targetCell.y,
		currentGrowthStage: 0,
		currentInvasionPower: card.baseInvasionPower ?? 1,
		currentInvasionShape: card.baseInvasionShape ?? 'single',
		turnsSinceLastAction: 0,
	};
	state.activeAlienInstances[newAlienInstance.instanceId] = newAlienInstance;

	const cellToUpdate = state.gameField.cells[targetCell.y][targetCell.x];
	cellToUpdate.cellType = 'alien_core';
	cellToUpdate.ownerId = 'alien_side';
	cellToUpdate.alienInstanceId = newAlienInstance.instanceId;
	cellToUpdate.dominantAlienInstanceId = newAlienInstance.instanceId;
};

/** 駆除カードの効果を適用する */
const applyEradicationCard = (state: GameState, card: CardDefinition, targetCell: CellState) => {
	const targetsToUpdate = getEffectRange(card, targetCell, state.gameField);
	targetsToUpdate.forEach(target => {
		const cellToUpdate = state.gameField.cells[target.y][target.x];
		// コアが置かれているマスが駆除された場合、対応するインスタンスを削除
		if (cellToUpdate.alienInstanceId && state.activeAlienInstances[cellToUpdate.alienInstanceId]) {
			delete state.activeAlienInstances[cellToUpdate.alienInstanceId];
		}
		// マスの状態を更新
		cellToUpdate.cellType = card.postRemovalState || 'empty_area';
		cellToUpdate.ownerId = null;
		cellToUpdate.alienInstanceId = null;
		cellToUpdate.dominantAlienInstanceId = null;
	});
};

/** 回復カードの効果を適用する */
const applyRecoveryCard = (state: GameState, card: CardDefinition, targetCell: CellState) => {
	const targetsToUpdate = getEffectRange(card, targetCell, state.gameField);
	targetsToUpdate.forEach(target => {
		const cellToUpdate = state.gameField.cells[target.y][target.x];
		if (cellToUpdate.cellType === 'empty_area' || cellToUpdate.cellType === 'recovery_pending_area') {
			cellToUpdate.cellType = 'native_area';
			cellToUpdate.ownerId = 'native_side';
		}
	});
};

/** 外来種サイドの活性フェーズ処理を実行する */
const runAlienActivationPhase = (state: GameState) => {
	// 1. 侵略優先度（コスト高 > 召喚ターン新）に基づいて外来種をソート
	const sortedAliens: ActiveAlienInstance[] = Object.values(state.activeAlienInstances).sort((a, b) => {
		const costA = cardMasterData.find(c => c.id === a.cardDefinitionId)?.cost ?? 0;
		const costB = cardMasterData.find(c => c.id === b.cardDefinitionId)?.cost ?? 0;
		if (costA !== costB) return costB - costA;
		return b.spawnedTurn - a.spawnedTurn;
	});

	// 2. ソートされた順に各外来種の処理を行う
	sortedAliens.forEach(alien => {
		if (!state.activeAlienInstances[alien.instanceId]) return; // 処理中に除去された可能性を考慮

		const cardDef = cardMasterData.find(c => c.id === alien.cardDefinitionId);
		if (!cardDef) return;

		// 2-1. [成長処理]（実装は省略）

		// 2-2. [侵略処理]
		const invasionTargets = calculateInvasionTargets(alien, state.gameField);
		invasionTargets.forEach(target => {
			const cell = state.gameField.cells[target.y][target.x];
			if (cell.cellType === 'alien_core') return; // 他のコアには侵略不可

			const existingDominantAlien = cell.dominantAlienInstanceId ? state.activeAlienInstances[cell.dominantAlienInstanceId] : null;
			const shouldOverwrite = !existingDominantAlien || checkInvasionPriority(alien, existingDominantAlien);

			if (shouldOverwrite) {
				cell.cellType = 'alien_invasion_area';
				cell.ownerId = 'alien_side';
				cell.dominantAlienInstanceId = alien.instanceId;
			}
		});
	});

	// 3. [クリンナップ処理] 支配マスを失った外来種を消滅
	const dominantCounts = countDominantCells(state.gameField);
	Object.keys(state.activeAlienInstances).forEach(instanceId => {
		// コア自身の1マス分を除いて、支配マス数が0なら除去
		if (!dominantCounts[instanceId] || dominantCounts[instanceId] <= 1) {
			const alienToRemove = state.activeAlienInstances[instanceId];
			if (alienToRemove) {
				const coreCell = state.gameField.cells[alienToRemove.currentY][alienToRemove.currentX];
				if (coreCell.alienInstanceId === instanceId) {
					coreCell.cellType = 'empty_area';
					coreCell.ownerId = null;
					coreCell.alienInstanceId = null;
					coreCell.dominantAlienInstanceId = null;
				}
				delete state.activeAlienInstances[instanceId];
			}
		}
	});
};

/** 在来種サイドの活性フェーズ処理を実行する */
const runNativeActivationPhase = (state: GameState) => {
	// 1. 再生待機(黄) -> 在来種(緑) に変化
	state.gameField.cells.flat().forEach(cell => {
		if (cell.cellType === 'recovery_pending_area') {
			cell.cellType = 'native_area';
			cell.ownerId = 'native_side';
		}
	});
	// 2. 空(灰) -> 再生待機(黄) に変化
	state.gameField.cells.flat().forEach(cell => {
		if (cell.cellType === 'empty_area') {
			cell.cellType = 'recovery_pending_area';
		}
	});
};


// --- 活性フェーズの計算補助関数 ---

const calculateInvasionTargets = (alien: ActiveAlienInstance, field: FieldState): { x: number; y: number }[] => {
	const targets: { x: number; y: number }[] = [];
	const { width, height } = field;
	const { currentX, currentY, currentInvasionPower, currentInvasionShape } = alien;

	switch (currentInvasionShape) {
		case 'cross':
			for (let i = 1; i <= currentInvasionPower; i++) {
				targets.push({ x: currentX, y: currentY + i });
				targets.push({ x: currentX, y: currentY - i });
				targets.push({ x: currentX + i, y: currentY });
				targets.push({ x: currentX - i, y: currentY });
			}
			break;
		case 'range':
			for (let yOffset = -currentInvasionPower; yOffset <= currentInvasionPower; yOffset++) {
				for (let xOffset = -currentInvasionPower; xOffset <= currentInvasionPower; xOffset++) {
					if (xOffset === 0 && yOffset === 0) continue;
					targets.push({ x: currentX + xOffset, y: currentY + yOffset });
				}
			}
			break;
		case 'straight':
			for (let i = 1; i <= currentInvasionPower; i++) {
				targets.push({ x: currentX, y: currentY + i });
			}
			break;
		case 'single':
			// 侵略なし
			break;
	}
	return targets.filter(t => t.x >= 0 && t.x < width && t.y >= 0 && t.y < height);
};

const checkInvasionPriority = (newAlien: ActiveAlienInstance, existingAlien: ActiveAlienInstance): boolean => {
	const costA = cardMasterData.find(c => c.id === newAlien.cardDefinitionId)?.cost ?? 0;
	const costB = cardMasterData.find(c => c.id === existingAlien.cardDefinitionId)?.cost ?? 0;
	if (costA !== costB) return costA > costB;
	return newAlien.spawnedTurn > existingAlien.spawnedTurn;
};

const countDominantCells = (field: FieldState): { [key: string]: number } => {
	const counts: { [key: string]: number } = {};
	field.cells.flat().forEach(cell => {
		if (cell.dominantAlienInstanceId) {
			counts[cell.dominantAlienInstanceId] = (counts[cell.dominantAlienInstanceId] || 0) + 1;
		}
	});
	return counts;
};