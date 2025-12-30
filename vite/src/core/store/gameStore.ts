import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { GAME_SETTINGS } from "@/shared/constants/game-config";
import { GameState, PlayerState, CellState } from "@/shared/types/game-schema";
import { PlayerType } from "@/shared/types/primitives";
import cardMasterData from "@/shared/data/cardMasterData"; // カードデータのインポート

// 簡易ID生成 (shared/utils/id.ts があればそれを使う)
const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * 初期デッキ生成ヘルパー
 */
const createInitialLibrary = (playerType: PlayerType) => {
	// テスト用にカードを数枚配布
	return cardMasterData
		.filter(c => c.cardType === (playerType === "alien" ? "alien" : "eradication") || c.cardType === "recovery")
		.slice(0, 5) // 最初の5枚だけ
		.map(card => ({
			instanceId: `${card.id}-instance-${generateId()}`,
			cardDefinitionId: card.id
		}));
};

const createInitialPlayerState = (id: PlayerType, name: string): PlayerState => ({
	playerId: id,
	playerName: name,
	facingFactor: id === "native" ? -1 : 1,
	initialEnvironment: 1,
	currentEnvironment: 1,
	maxEnvironment: 1,
	cardLibrary: createInitialLibrary(id), // ここでカードを持たせる
	cooldownActiveCards: [],
	limitedCardsUsedCount: {},
});

/**
 * 空の盤面データを生成（詳細はFieldSystemが担うが、初期値として型を満たす最小限を用意）
 */
const createInitialFieldState = () => {
	const { FIELD_WIDTH, FIELD_HEIGHT } = GAME_SETTINGS;
	// 仮の空配列（実際の初期化はFieldSystemで行うか、ここで行う）
	// ここでは型整合のため空のセル配列を作成
	return {
		width: FIELD_WIDTH,
		height: FIELD_HEIGHT,
		cells: [] as CellState[][], // 後でFieldSystemが埋める
	};
};

const initialGameState: GameState = {
	currentTurn: 1,
	maximumTurns: GAME_SETTINGS.MAXIMUM_TURNS,
	activePlayerId: "alien",
	currentPhase: "summon_phase",
	isGameOver: false,
	winningPlayerId: null,
	gameField: createInitialFieldState(),
	playerStates: {
		native: createInitialPlayerState("native", "在来種"),
		alien: createInitialPlayerState("alien", "外来種"),
	},
	activeAlienInstances: {},
	nativeScore: 0,
	alienScore: 0,
	history: [],
};

/**
 * Core Store Definition
 * 純粋なデータ保持のみを行う
 */
interface GameStore extends GameState {
	/**
	 * 内部用State更新関数 (Core Systemsのみが使用する)
	 * ※外部Featureからは直接呼んではならない
	 */
	internal_mutate: (recipe: (draft: GameState) => void) => void;

	/**
	 * ゲームリセット
	 */
	reset: () => void;
}

export const useGameStore = create(
	immer<GameStore>((set) => ({
		...initialGameState,

		internal_mutate: (recipe) => set(recipe),

		reset: () => set(initialGameState),
	}))
);