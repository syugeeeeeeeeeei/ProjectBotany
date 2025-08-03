import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ActiveAlienInstance, CellState, FieldState, GameState, PlayerId, PlayerState } from '../types/data';
import cardMasterData from './cardMasterData'; // cardMasterDataを外部ファイルからインポート

// --- 定数定義 ---

/**
 * ゲームの基本設定。盤面のサイズ、ターン数など、ゲームの根幹に関わる不変の値を定義する。
 */
const GAME_SETTINGS = {
	FIELD_WIDTH: 7,
	FIELD_HEIGHT: 10,
	MAXIMUM_TURNS: 8,
};

// --- 型定義 ---

// UIの状態を含む、ゲーム全体のstateの型
interface GameStateWithSelection extends GameState {
	selectedCardId: string | null;            // 現在選択中のカードインスタンスID
	selectedAlienInstanceId: string | null; // 現在選択中の外来種インスタンスID
	notification: { message: string; forPlayer: PlayerId } | null; // プレイヤーへの通知
}

// ゲームの状態を変更するためのアクション（関数）の型
interface GameActions {
	progressTurn: () => void;
	selectCard: (cardId: string | null) => void;
	playCard: (targetCell: CellState) => void;
	selectAlienInstance: (instanceId: string | null) => void;
	moveAlien: (targetCell: CellState) => void;
	setNotification: (message: string | null, forPlayer?: PlayerId) => void;
	resetGame: () => void;
}

// --- 初期状態生成関数 ---

/** ゲーム全体の初期状態を生成する */
const createInitialGameState = (): GameStateWithSelection => ({
	currentTurn: 1,
	maximumTurns: GAME_SETTINGS.MAXIMUM_TURNS,
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

/** プレイヤー一人の初期状態を生成する */
const createInitialPlayerState = (id: PlayerId, name: string): PlayerState => ({
	playerId: id,
	playerName: name,
	currentEnvironment: 1,
	maxEnvironment: 1,
	cardLibrary: [], // App.tsxで動的に生成
	cooldownActiveCards: [],
	limitedCardsUsedCount: {},
});

/** フィールド（盤面）の初期状態を生成する（全て在来種マス） */
const createInitialFieldState = (): FieldState => {
	const { FIELD_WIDTH, FIELD_HEIGHT } = GAME_SETTINGS;
	const cells = Array.from({ length: FIELD_HEIGHT }, (_, y) =>
		Array.from({ length: FIELD_WIDTH }, (_, x): CellState => ({
			x, y,
			cellType: 'native_area',
			ownerId: 'native_side',
			alienInstanceId: null,
			dominantAlienInstanceId: null,
			recoveryPendingTurn: null,
		}))
	);
	return { width: FIELD_WIDTH, height: FIELD_HEIGHT, cells };
};

// --- Zustand Store ---

export const useGameStore = create(
	// immerミドルウェアでラップすることで、set関数内でstateを直接変更できるようになる
	immer<GameStateWithSelection & GameActions>((set) => ({
		// 初期stateを設定
		...createInitialGameState(),

		/** ゲームを完全に初期状態に戻す */
		resetGame: () => set(createInitialGameState()),

		/** ターンを進行させる（活性フェーズの処理とプレイヤー交代） */
		progressTurn: () => set((state) => {
			// immerがstateをdraftとして扱うため、直接変更が可能。ディープコピーは不要。

			// ゲーム終了後は何も処理しない
			if (state.isGameOver) return;

			// [共通処理] 全プレイヤーのクールダウン中のカードの残りターンを1減らす
			(Object.keys(state.playerStates) as PlayerId[]).forEach(playerId => {
				const player = state.playerStates[playerId];
				player.cooldownActiveCards = player.cooldownActiveCards
					.map(c => ({ ...c, turnsRemaining: c.turnsRemaining - 1 }))
					.filter(c => c.turnsRemaining > 0);
			});

			// [活性フェーズ] アクティブプレイヤーに応じた自動処理
			if (state.activePlayerId === 'alien_side') {
				// --- 外来種サイドの自動処理 ---

				// 1. 侵略優先度（コスト高 > 召喚ターン新）に基づいて外来種をソート
				const sortedAliens: ActiveAlienInstance[] = Object.values(state.activeAlienInstances).sort((a, b) => {
					const costA = cardMasterData.find(c => c.id === a.cardDefinitionId)?.cost ?? 0;
					const costB = cardMasterData.find(c => c.id === b.cardDefinitionId)?.cost ?? 0;
					if (costA !== costB) return costB - costA;
					return b.spawnedTurn - a.spawnedTurn;
				});

				// 2. ソートされた順に各外来種の処理を行う
				sortedAliens.forEach(alien => {
					// 外来種が何らかの理由で既に削除されている場合はスキップ
					if (!state.activeAlienInstances[alien.instanceId]) return;

					const cardDef = cardMasterData.find(c => c.id === alien.cardDefinitionId);
					if (!cardDef) return;

					// 2-1. [成長処理] 条件を満たしているかチェック
					if (cardDef.canGrow && cardDef.growthConditions && cardDef.growthEffects && alien.currentGrowthStage < cardDef.growthConditions.length) {
						const condition = cardDef.growthConditions[alien.currentGrowthStage];
						// 条件タイプが「最終アクションからのターン経過」の場合
						if (condition.type === 'turns_since_last_action' && (state.currentTurn - alien.spawnedTurn) >= condition.value) {
							const effect = cardDef.growthEffects[alien.currentGrowthStage];
							// 効果タイプが「侵略力増加」の場合
							if (effect && effect.type === 'increase_invasion_power' && effect.value !== undefined) {
								alien.currentInvasionPower += effect.value;
								alien.currentGrowthStage++;
								// TODO: 成長したことをユーザーに通知する手段を追加しても良い
							}
						}
					}

					// 2-2. [侵略処理] 侵略対象となるマスを計算
					const invasionTargets: { x: number; y: number }[] = [];
					const { width, height } = state.gameField;
					const { currentX, currentY, currentInvasionPower, currentInvasionShape } = alien;

					switch (currentInvasionShape) {
						case 'cross':
							for (let i = 1; i <= currentInvasionPower; i++) {
								invasionTargets.push({ x: currentX, y: currentY + i });
								invasionTargets.push({ x: currentX, y: currentY - i });
								invasionTargets.push({ x: currentX + i, y: currentY });
								invasionTargets.push({ x: currentX - i, y: currentY });
							}
							break;
						case 'straight':
							for (let i = 1; i <= currentInvasionPower; i++) {
								invasionTargets.push({ x: currentX, y: currentY + i });
								invasionTargets.push({ x: currentX, y: currentY - i });
							}
							break;
						case 'range':
							for (let y = currentY - currentInvasionPower; y <= currentY + currentInvasionPower; y++) {
								for (let x = currentX - currentInvasionPower; x <= currentX + currentInvasionPower; x++) {
									if (x === currentX && y === currentY) continue; // 自分自身のマスは除く
									invasionTargets.push({ x, y });
								}
							}
							break;
						case 'single':
							// 'single'は本来侵略しないが、念のため定義
							break;
					}

					// 2-3. 各侵略対象マスについて、支配権を更新
					invasionTargets.forEach(target => {
						// 盤面の範囲外は無視
						if (target.y < 0 || target.y >= height || target.x < 0 || target.x >= width) return;

						const cell = state.gameField.cells[target.y][target.x];

						// 他の外来種のコアマスには侵略できない
						if (cell.cellType === 'alien_core') return;

						// 支配権の競合を解決する
						const existingDominantAlien = cell.dominantAlienInstanceId ? state.activeAlienInstances[cell.dominantAlienInstanceId] : null;
						const existingDominantCost = existingDominantAlien ? (cardMasterData.find(c => c.id === existingDominantAlien.cardDefinitionId)?.cost ?? 0) : -1;
						const newAlienCost = cardDef.cost;

						// 新しい外来種の方が優先度が高い、またはまだ誰も支配していない場合、支配権を獲得
						if (!existingDominantAlien || newAlienCost > existingDominantCost || (newAlienCost === existingDominantCost && alien.spawnedTurn > existingDominantAlien.spawnedTurn)) {
							cell.cellType = 'alien_invasion_area';
							cell.ownerId = 'alien_side';
							cell.dominantAlienInstanceId = alien.instanceId;
						}
					});
				});

				// 3. [クリンナップ処理] 侵略後の結果を判定し、支配マスを失った外来種を消滅させる
				// 3-1. 各外来種の現在の支配マス数をカウント
				const dominantCounts: { [key: string]: number } = {};
				state.gameField.cells.flat().forEach(cell => {
					if (cell.dominantAlienInstanceId) {
						dominantCounts[cell.dominantAlienInstanceId] = (dominantCounts[cell.dominantAlienInstanceId] || 0) + 1;
					}
				});
				// 3-2. 支配マスが0になった外来種（コアマス自身を除く）を盤上から除去
				Object.keys(state.activeAlienInstances).forEach(instanceId => {
					// コア自身の1マス分を除いて、支配マス数が0なら除去
					if (!dominantCounts[instanceId] || dominantCounts[instanceId] <= 1) {
						const alienToRemove = state.activeAlienInstances[instanceId];
						if (alienToRemove) {
							// コアがあったマスを空き地に戻す
							const coreCell = state.gameField.cells[alienToRemove.currentY][alienToRemove.currentX];
							if (coreCell.alienInstanceId === instanceId) {
								coreCell.cellType = 'empty_area';
								coreCell.ownerId = null;
								coreCell.alienInstanceId = null;
								coreCell.dominantAlienInstanceId = null;
							}
							// アクティブな外来種リストから削除
							delete state.activeAlienInstances[instanceId];
						}
					}
				});

			} else {
				// --- 在来種サイドの自動処理 ---
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
			}

			// [ターン終了処理]
			// 1. 次のプレイヤーを決定
			const nextPlayerId = state.activePlayerId === 'alien_side' ? 'native_side' : 'alien_side';
			// 2. 外来種サイドのターンが始まる時にターン数を進める
			const isNewTurnStarting = nextPlayerId === 'alien_side';
			const nextTurn = isNewTurnStarting ? state.currentTurn + 1 : state.currentTurn;

			// 3. 全プレイヤーのエンバイロメントを最大値まで回復・更新
			(Object.keys(state.playerStates) as PlayerId[]).forEach(playerId => {
				const player = state.playerStates[playerId];
				player.maxEnvironment = nextTurn;
				player.currentEnvironment = nextTurn;
			});

			// [勝敗判定]
			const isGameOver = nextTurn > GAME_SETTINGS.MAXIMUM_TURNS;
			if (isGameOver && !state.isGameOver) {
				const nativeScore = state.gameField.cells.flat().filter(c => c.ownerId === 'native_side').length;
				const alienScore = state.gameField.cells.flat().filter(c => c.ownerId === 'alien_side').length;
				if (nativeScore > alienScore) {
					state.winningPlayerId = 'native_side';
				} else if (alienScore > nativeScore) {
					state.winningPlayerId = 'alien_side';
				} else {
					state.winningPlayerId = null; // 引き分け
				}
			}

			// [Stateの更新]
			state.currentTurn = nextTurn;
			state.activePlayerId = nextPlayerId;
			state.isGameOver = isGameOver;
			state.selectedCardId = null; // ターン終了時にカード選択は解除
			state.selectedAlienInstanceId = null; // ターン終了時に外来種選択は解除
		}),

		/** プレイヤーが手札のカードを選択/選択解除する */
		selectCard: (cardId) => set((state) => {
			const cardDefId = cardId?.split('-instance-')[0];
			// クールダウン中のカードは選択不可
			if (state.playerStates[state.activePlayerId].cooldownActiveCards.some(c => c.cardId === cardDefId)) {
				state.notification = { message: `このカードはクールタイム中です。`, forPlayer: state.activePlayerId };
				return;
			}
			// カードを選択し、外来種の選択は解除する
			state.selectedCardId = cardId;
			state.selectedAlienInstanceId = null;
		}),

		/** 選択中のカードを対象のセルに使用する */
		playCard: (targetCell) => set((state) => {
			const { selectedCardId, activePlayerId } = state;
			if (!selectedCardId) return; // カードが選択されていなければ何もしない

			const cardId = selectedCardId.split('-instance-')[0];
			const card = cardMasterData.find(c => c.id === cardId);
			if (!card) return; // マスターデータにカードがなければ何もしない

			// コストが足りているかチェック
			const currentPlayer = state.playerStates[activePlayerId];
			if (currentPlayer.currentEnvironment < card.cost) {
				state.notification = { message: "エンバイロメントが足りません！", forPlayer: activePlayerId };
				return;
			}

			const targetsToUpdate: CellState[] = [];
			const { width, height } = state.gameField;

			// カードの種類に応じて処理を分岐
			switch (card.cardType) {
				case 'alien': {
					// 配置できないマス（空、再生待機、他のコア）を指定した場合は通知を出して中断
					if (targetCell.cellType === 'empty_area' || targetCell.cellType === 'recovery_pending_area' || targetCell.cellType === 'alien_core') {
						state.notification = { message: "このマスには配置できません", forPlayer: activePlayerId };
						return;
					}
					// 新しい外来種のインスタンスを作成
					const newAlienInstance: ActiveAlienInstance = {
						instanceId: nanoid(), cardDefinitionId: card.id, spawnedTurn: state.currentTurn,
						currentX: targetCell.x, currentY: targetCell.y, currentGrowthStage: 0,
						currentInvasionPower: card.baseInvasionPower ?? 1, currentInvasionShape: card.baseInvasionShape ?? 'single',
						turnsSinceLastAction: 0
					};
					state.activeAlienInstances[newAlienInstance.instanceId] = newAlienInstance;
					// 配置したマスの状態を「外来種コア」に更新
					const cellToUpdate = state.gameField.cells[targetCell.y][targetCell.x];
					cellToUpdate.cellType = 'alien_core';
					cellToUpdate.ownerId = 'alien_side';
					cellToUpdate.alienInstanceId = newAlienInstance.instanceId;
					cellToUpdate.dominantAlienInstanceId = newAlienInstance.instanceId;
					break;
				}
				case 'eradication': {
					const method = card.removalMethod;
					switch (method) {
						case 'direct_n_cells': // 1マスを直接指定
							targetsToUpdate.push(state.gameField.cells[targetCell.y][targetCell.x]);
							break;
						case 'range_selection': // 範囲を指定（現在は2x2で固定）
							for (let y = targetCell.y; y < targetCell.y + 2; y++) {
								for (let x = targetCell.x; x < targetCell.x + 2; x++) {
									if (x >= 0 && x < width && y >= 0 && y < height) {
										targetsToUpdate.push(state.gameField.cells[y][x]);
									}
								}
							}
							break;
						case 'target_alien_and_its_dominant_cells': // 特定の外来種とその支配マス全てが対象
							const dominantId = state.gameField.cells[targetCell.y][targetCell.x].dominantAlienInstanceId;
							if (!dominantId) return; // 支配者がいないマスなら何もしない
							state.gameField.cells.flat().forEach(cell => {
								if (cell.dominantAlienInstanceId === dominantId) targetsToUpdate.push(cell);
							});
							break;
					}
					// 決定した対象マス全てを駆除後の状態に更新
					targetsToUpdate.forEach(target => {
						const cellToUpdate = state.gameField.cells[target.y][target.x];
						if (cellToUpdate.alienInstanceId) delete state.activeAlienInstances[cellToUpdate.alienInstanceId];
						cellToUpdate.cellType = card.postRemovalState || 'empty_area';
						cellToUpdate.ownerId = null;
						cellToUpdate.alienInstanceId = null;
						cellToUpdate.dominantAlienInstanceId = null;
					});
					break;
				}
				case 'recovery': {
					if (targetCell.cellType === 'empty_area' || targetCell.cellType === 'recovery_pending_area') {
						const cellToUpdate = state.gameField.cells[targetCell.y][targetCell.x];
						cellToUpdate.cellType = 'native_area';
						cellToUpdate.ownerId = 'native_side';
					} else {
						state.notification = { message: 'このマスは回復できません。', forPlayer: activePlayerId };
						return;
					}
					break;
				}
			}

			// [共通の後処理]
			// クールダウンが設定されていれば、リストに追加
			if (card.cooldownTurns) {
				currentPlayer.cooldownActiveCards.push({ cardId, turnsRemaining: card.cooldownTurns });
			}
			// コストを消費し、カード選択を解除
			currentPlayer.currentEnvironment -= card.cost;
			state.selectedCardId = null;
		}),

		/** フィールド上の外来種を選択/選択解除する */
		selectAlienInstance: (instanceId) => set((state) => {
			// 外来種サイドでなければ選択不可
			if (state.activePlayerId !== 'alien_side') {
				state.notification = { message: "外来種サイドのターンではありません。", forPlayer: 'native_side' };
				return;
			}
			// 既に選択中の外来種をクリックした場合は選択解除
			if (state.selectedAlienInstanceId === instanceId) {
				state.selectedAlienInstanceId = null;
				return;
			}
			// 外来種を選択し、カード選択は解除
			state.selectedAlienInstanceId = instanceId;
			state.selectedCardId = null;
		}),

		/** 選択中の外来種を対象のセルに移動させる */
		moveAlien: (targetCell) => set((state) => {
			const { selectedAlienInstanceId, activePlayerId } = state;
			if (!selectedAlienInstanceId) return;

			const alien = state.activeAlienInstances[selectedAlienInstanceId];
			if (!alien) return;

			const originalCard = cardMasterData.find(c => c.id === alien.cardDefinitionId);
			if (!originalCard) return;

			const moveCost = originalCard.cost;
			const currentPlayer = state.playerStates[activePlayerId];
			// コストチェック
			if (currentPlayer.currentEnvironment < moveCost) {
				state.notification = { message: "移動のためのエンバイロメントが足りません！", forPlayer: activePlayerId };
				return;
			}
			// 移動は自身の侵略マスにしかできない
			if (targetCell.cellType !== 'alien_invasion_area' || targetCell.dominantAlienInstanceId !== alien.instanceId) {
				state.notification = { message: "自身の侵略マスにしか移動できません", forPlayer: activePlayerId };
				return;
			}

			// 元いたマスの外来種情報をクリア
			state.gameField.cells[alien.currentY][alien.currentX].alienInstanceId = null;
			// 移動先のマスを新しいコアにする
			const targetCellToUpdate = state.gameField.cells[targetCell.y][targetCell.x];
			targetCellToUpdate.cellType = 'alien_core';
			targetCellToUpdate.alienInstanceId = alien.instanceId;

			// 外来種インスタンス自体の座標を更新
			alien.currentX = targetCell.x;
			alien.currentY = targetCell.y;
			alien.turnsSinceLastAction = 0;

			// コストを消費し、選択を解除
			currentPlayer.currentEnvironment -= moveCost;
			state.selectedAlienInstanceId = null;
		}),

		/** 画面に通知メッセージを表示/非表示する */
		setNotification: (message, forPlayer) => set((state) => {
			if (message && forPlayer) {
				state.notification = { message, forPlayer };
			} else {
				state.notification = null;
			}
		}),
	}))
);