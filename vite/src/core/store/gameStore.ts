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

/**
 * ゲームの初期設定定数
 */
const INITIAL_MAX_ROUNDS = 8;
const INITIAL_ENVIRONMENT = 1; // 1ラウンド目は1からスタート
const FIELD_WIDTH = 7;
const FIELD_HEIGHT = 10;

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
    maximumRounds: INITIAL_MAX_ROUNDS,
    activePlayerId: "alien", // 外来種(先攻)
    currentPhase: "start",
    isGameOver: false,
    winningPlayerId: null,
    nativeScore: 0,
    alienScore: 0,
    history: [],

    // フィールド (初期化は initializeGame で実施)
    gameField: {
      width: FIELD_WIDTH,
      height: FIELD_HEIGHT,
      cells: [],
    },

    // 外来種インスタンス (空で初期化)
    alienInstances: {},

    // プレイヤー状態
    playerStates: {
      native: createInitialPlayerState("native", "在来種サイド"),
      alien: createInitialPlayerState("alien", "外来種サイド"),
    },

    // --- アクション ---

    initializeGame: () => {
      // 1. フィールドの生成 (裸地10個ランダム)
      const initialField = FieldSystem.initializeField(
        FIELD_WIDTH,
        FIELD_HEIGHT
      );

      // 2. プレイヤー状態のリセット (手札生成など)
      const nativeState = createInitialPlayerState("native", "在来種サイド");
      const alienState = createInitialPlayerState("alien", "外来種サイド");

      set({
        currentRound: 1,
        activePlayerId: "alien",
        currentPhase: "start",
        isGameOver: false,
        winningPlayerId: null,
        nativeScore: 0,
        alienScore: 0,
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
  // デッキ構築: マスタデータから cardType が一致するものを抽出して手札へ
  const library: CardInstance[] = [];

  cardMasterData.forEach((cardDef) => {
    // プレイヤータイプとカードタイプの対応
    // native -> eradication, recovery
    // alien -> alien
    const isAlienCard = cardDef.cardType === "alien";
    const isOwner =
      playerId === "alien" ? isAlienCard : !isAlienCard;

    if (isOwner) {
      // deckCount枚数分インスタンスを作成
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
    initialEnvironment: INITIAL_ENVIRONMENT,
    currentEnvironment: INITIAL_ENVIRONMENT,
    maxEnvironment: INITIAL_ENVIRONMENT,
    cardLibrary: library,
    cooldownActiveCards: [],
    limitedCardsUsedCount: {},
  };
}