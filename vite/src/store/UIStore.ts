import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import cardMasterData from '../data/cardMasterData';
import * as logic from '../logic/gameLogic'; // ゲームロジックをインポート
import type { CellState, GameState, PlayerId, PlayerState } from '../types/data';

// --- 定数定義 ---
const GAME_SETTINGS = {
	FIELD_WIDTH: 7,
	FIELD_HEIGHT: 10,
	MAXIMUM_TURNS: 8,
};
const DEFAULT_PREVIEW_POSITION = { x: 3, y: 5 }; // プレビューの初期位置

// --- 型定義 ---

/** UI固有の状態を管理する型 */
interface UIState {
	selectedCardId: string | null;
	selectedAlienInstanceId: string | null; // 「Alien」は外来種を指す
	notification: { message: string; forPlayer: PlayerId } | null;
	previewPlacement: { x: number; y: number } | null; // プレビューコマの盤面上の位置
}

/** UIの状態を変更するためのアクション（関数）の型 */
interface UIActions {
	// ゲームロジックを呼び出すアクション
	playSelectedCard: () => void; // プレビュー位置に選択中カードを使用する
	progressTurn: () => void;
	moveAlien: (targetCell: CellState) => void;
	// UI状態のみを変更するアクション
	selectCard: (cardId: string) => void;
	deselectCard: () => void;
	selectAlienInstance: (instanceId: string | null) => void;
	setNotification: (message: string | null, forPlayer?: PlayerId) => void;
	resetGame: () => void;
	setPreviewPlacement: (position: { x: number; y: number } | null) => void;
}

// --- 初期状態生成関数 ---

/** ゲームロジックの初期状態を生成する */
const createInitialGameState = (): GameState => ({
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
});

/** UIの初期状態を生成する */
const createInitialUIState = (): UIState => ({
	selectedCardId: null,
	selectedAlienInstanceId: null,
	notification: null,
	previewPlacement: null,
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

/** フィールド（盤面）の初期状態を生成する */
const createInitialFieldState = (): GameState['gameField'] => {
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

type StoreState = GameState & UIState & UIActions;

export const useUIStore = create(
	immer<StoreState>((set, get) => ({
		...createInitialGameState(),
		...createInitialUIState(),

		// --- ゲームロジックを呼び出すアクション ---

		/** プレビュー位置に選択中カードを使用する */
		playSelectedCard: () => {
			const { selectedCardId, previewPlacement, gameField } = get();
			if (!selectedCardId || !previewPlacement) return;

			const card = cardMasterData.find(c => c.id === selectedCardId.split('-instance-')[0]);
			if (!card) return;

			const targetCell = gameField.cells[previewPlacement.y][previewPlacement.x];
			const result = logic.playCardLogic(get(), card, targetCell);

			if (typeof result === 'string') {
				set({ notification: { message: result, forPlayer: get().activePlayerId } });
			} else {
				set({ ...result, selectedCardId: null, previewPlacement: null });
			}
		},

		/** ターンを進行させる */
		progressTurn: () => {
			const nextState = logic.progressTurnLogic(get());
			set({ ...nextState, selectedCardId: null, selectedAlienInstanceId: null, previewPlacement: null });
		},

		/** 選択中の外来種を対象のセルに移動させる */
		moveAlien: (targetCell) => {
			const { selectedAlienInstanceId } = get();
			if (!selectedAlienInstanceId) return;
			const result = logic.moveAlienLogic(get(), selectedAlienInstanceId, targetCell);
			if (typeof result === 'string') {
				set({ notification: { message: result, forPlayer: get().activePlayerId } });
			} else {
				set({ ...result, selectedAlienInstanceId: null });
			}
		},

		// --- UI状態のみを変更するアクション ---

		/** 手札のカードを選択する */
		selectCard: (cardId) => set((state) => {
			const cardDefId = cardId.split('-instance-')[0];
			const player = state.playerStates[state.activePlayerId];

			// クールダウンのチェック
			if (player.cooldownActiveCards.some(c => c.cardId === cardDefId)) {
				state.notification = { message: `このカードはクールタイム中です。`, forPlayer: state.activePlayerId };
				return;
			}

			const cardDef = cardMasterData.find(c => c.id === cardDefId);
			if (!cardDef) return;

			// ★★★ 不具合修正箇所 ★★★
			// usageLimitが設定されていて、かつ使用回数が上限に達しているかチェック
			const limit = cardDef.usageLimit;
			const usedCount = player.limitedCardsUsedCount[cardDef.id] || 0;
			if (limit && usedCount >= limit) {
				state.notification = { message: `このカードはもう使用できません。`, forPlayer: state.activePlayerId };
				return;
			}

			// 問題なければカードを選択状態にする
			state.selectedCardId = cardId;
			state.selectedAlienInstanceId = null;
			state.previewPlacement = DEFAULT_PREVIEW_POSITION; // プレビューを初期位置に設定
		}),

		/** カードの選択を解除する */
		deselectCard: () => set({ selectedCardId: null, previewPlacement: null }),

		/** フィールド上の外来種を選択/選択解除する */
		selectAlienInstance: (instanceId) => set((state) => {
			if (state.activePlayerId !== 'alien_side') {
				state.notification = { message: "外来種サイドのターンではありません。", forPlayer: 'native_side' };
				return;
			}
			if (state.selectedAlienInstanceId === instanceId) {
				state.selectedAlienInstanceId = null;
				return;
			}
			state.selectedAlienInstanceId = instanceId;
			state.selectedCardId = null;
			state.previewPlacement = null;
		}),

		/** 画面に通知メッセージを表示/非表示する */
		setNotification: (message, forPlayer) => set((state) => {
			if (message && forPlayer) {
				state.notification = { message, forPlayer };
			} else {
				state.notification = null;
			}
		}),

		/** ゲームを完全に初期状態に戻す */
		resetGame: () => set({ ...createInitialGameState(), ...createInitialUIState() }),

		/** プレビューコマの表示位置を更新する */
		setPreviewPlacement: (position) => set((state) => {
			state.previewPlacement = position;
		}),
	}))
);