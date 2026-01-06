// vite/src/core/store/gameStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

import {
  GameState,
  PlayerState,
  CardInstance,
} from "@/shared/types/game-schema";
import { PlayerId } from "@/shared/types/primitives";
import { cardMasterData } from "@/shared/data/cardMasterData";
import { FieldSystem } from "../systems/FieldSystem";
// ✨ 修正: game-configから定数をインポート
import { GAME_SETTINGS } from "@/shared/constants/game-config";

interface GameStoreActions {
  /** ゲームを初期状態にリセット・開始する */
  initializeGame: () => void;

  /** 状態を部分的に更新する (Action用) */
  setState: (payload: Partial<GameState>) => void;
}

// Storeの型定義 (State + Actions)
type GameStore = GameState & GameStoreActions;

export const useGameStore = create<GameStore>()(
  devtools((set) => ({
    // --- 初期ステート ---
    currentRound: 1,
    maximumRounds: GAME_SETTINGS.MAXIMUM_ROUNDS,
    activePlayerId: "alien", // 外来種(先攻)
    currentPhase: "start",
    isGameOver: false,
    winningPlayerId: null,
    nativeScore: 0,
    alienScore: 0,
    history: [],

    // フィールド (初期化は initializeGame で実施)
    gameField: {
      width: GAME_SETTINGS.FIELD_WIDTH,
      height: GAME_SETTINGS.FIELD_HEIGHT,
      cells: [],
    },

    // 外来種インスタンス
    alienInstances: {},

    // プレイヤー状態
    playerStates: {
      native: createInitialPlayerState("native", "在来種"),
      alien: createInitialPlayerState("alien", "外来種"),
    },

    // --- アクション ---

    initializeGame: () => {
      // 1. フィールドの生成
      const initialField = FieldSystem.initializeField(
        GAME_SETTINGS.FIELD_WIDTH,
        GAME_SETTINGS.FIELD_HEIGHT
      );

      // 2. プレイヤー状態のリセット
      const nativeState = createInitialPlayerState("native", "在来種");
      const alienState = createInitialPlayerState("alien", "外来種");

      // 3. ✨ 修正: 初期スコアの算出
      // フィールド初期化直後の状態（在来種と裸地のみ）をカウントして反映
      const initialNativeScore = FieldSystem.countCellsByType(initialField, "native");
      const initialAlienScore = FieldSystem.countCellsByType(initialField, "alien");

      set({
        currentRound: 1,
        activePlayerId: "alien",
        currentPhase: "start",
        isGameOver: false,
        winningPlayerId: null,
        nativeScore: initialNativeScore,
        alienScore: initialAlienScore,
        history: [],
        gameField: initialField,
        alienInstances: {},
        playerStates: {
          native: nativeState,
          alien: alienState,
        },
      });
    },

    setState: (payload) => set((state) => ({ ...state, ...payload })),
  }))
);

/**
 * プレイヤーの初期状態を作成するヘルパー関数
 */
function createInitialPlayerState(
  playerId: PlayerId,
  name: string
): PlayerState {
  const library: CardInstance[] = [];

  cardMasterData.forEach((cardDef) => {
    const isAlienCard = cardDef.cardType === "alien";
    const isOwner = playerId === "alien" ? isAlienCard : !isAlienCard;

    if (isOwner) {
      for (let i = 0; i < cardDef.deckCount; i++) {
        library.push({
          instanceId: uuidv4(),
          cardDefinitionId: cardDef.id,
        });
      }
    }
  });

  return {
    playerId,
    playerName: name,
    facingFactor: playerId === "alien" ? 1 : -1,
    initialEnvironment: GAME_SETTINGS.INITIAL_ENVIRONMENT,
    currentEnvironment: GAME_SETTINGS.INITIAL_ENVIRONMENT,
    maxEnvironment: GAME_SETTINGS.INITIAL_ENVIRONMENT,
    cardLibrary: library,
    cooldownActiveCards: [],
    limitedCardsUsedCount: {},
  };
}