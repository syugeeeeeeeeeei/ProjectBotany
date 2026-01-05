// vite/src/core/store/gameStore.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { GAME_SETTINGS } from "@/shared/constants/game-config";
import { GameState, PlayerState, CellState } from "@/shared/types/game-schema";
import { PlayerType } from "@/shared/types/primitives";
import cardMasterData from "@/shared/data/cardMasterData";

// 簡易ID生成
const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * 初期デッキ生成ヘルパー
 */
const createInitialLibrary = (playerType: PlayerType) => {
  return cardMasterData
    .filter(
      (c) =>
        c.cardType === (playerType === "alien" ? "alien" : "eradication") ||
        c.cardType === "recovery",
    )
    .slice(0, 5) // 最初の5枚だけテスト用に配布
    .map((card) => ({
      instanceId: `${card.id}-instance-${generateId()}`,
      cardDefinitionId: card.id,
    }));
};

const createInitialPlayerState = (
  id: PlayerType,
  name: string,
): PlayerState => ({
  playerId: id,
  playerName: name,
  facingFactor: id === "native" ? -1 : 1,
  initialEnvironment: 1,
  currentEnvironment: 1,
  maxEnvironment: 1,
  cardLibrary: createInitialLibrary(id),
  cooldownActiveCards: [],
  limitedCardsUsedCount: {},
});

/**
 * 初期フィールド生成（空のフィールド）
 * ※ 実際の初期配置はGameInitなどでFieldSystemを使って行う想定ですが、
 * Store初期化時点でnullにならないよう型を満たす空配列を用意します。
 */
const createInitialFieldState = () => {
  const { FIELD_WIDTH, FIELD_HEIGHT } = GAME_SETTINGS;
  return {
    width: FIELD_WIDTH,
    height: FIELD_HEIGHT,
    cells: [] as CellState[][], // FieldSystem.initField() で後ほど上書きされる
  };
};

const initialGameState: GameState = {
  currentRound: 1,
  maximumRounds: GAME_SETTINGS.MAXIMUM_ROUNDS,
  activePlayerId: "alien", // 先攻は外来種
  currentPhase: "round_start", // ラウンド開始フェーズからスタート
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
  })),
);