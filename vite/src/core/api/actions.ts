// src/core/api/actions.ts
import { z } from "zod";
import { RoundSystem } from "@/core/systems/RoundSystem";
import { TurnSystem } from "@/core/systems/TurnSystem";
import { useGameStore } from "@/core/store/gameStore";
import { useUIStore } from "@/core/store/uiStore";
import { CellState, PlayerType, GameState } from "@/shared/types";

// --- Validation Schemas ---
const MutateCellSchema = z.object({
  x: z.number(),
  y: z.number(),
  type: z.enum(["native", "alien", "bare", "pioneer"]),
});

const NotifySchema = z.object({
  message: z.string(),
  player: z.enum(["native", "alien"]).optional(),
});

const SelectCardSchema = z.string().uuid();

/**
 * Feature向け 公開操作API (Commands)
 */
export const gameActions = {
  /** システム操作 */
  system: {
    reset: () => {
      useGameStore.getState().initializeGame();
    },
    updateState: (payload: Partial<GameState>) => {
      useGameStore.getState().setState(payload);
    },
  },

  /** 進行操作 */
  round: {
    start: () => {
      const currentState = useGameStore.getState();
      const nextState = RoundSystem.startRound(currentState);
      useGameStore.getState().setState(nextState);
    },
    end: () => {
      const currentState = useGameStore.getState();
      RoundSystem.endRoundProcess(currentState);
    },
  },

  /** ターン操作 */
  turn: {
    end: () => {
      const currentState = useGameStore.getState();

      // 1. ターンの切り替え
      const afterTurnState = TurnSystem.nextTurn(currentState);
      useGameStore.getState().setState(afterTurnState);

      // 2. 在来種が終了し、フェーズが "end" (ラウンド終了フェーズ) になったら自動実行
      if (afterTurnState.currentPhase === "end") {
        RoundSystem.endRoundProcess(afterTurnState);
      }
    },
  },

  /** 盤面操作 */
  field: {
    mutateCell: (input: unknown) => {
      const { x, y, type } = MutateCellSchema.parse(input);
      console.log("Safe Mutate:", x, y, type);
    },
  },

  /** UI操作 */
  ui: {
    selectCard: (cardId: string) => {
      SelectCardSchema.parse(cardId);
      useUIStore.getState().selectCard(cardId);
    },
    deselectCard: () => useUIStore.getState().deselectCard(),
    hoverCell: (cell: CellState | null) => useUIStore.getState().hoverCell(cell),
    /** ✨ デバッグ設定更新用 */
    updateDebugSettings: (settings: Parameters<ReturnType<typeof useUIStore.getState>["updateDebugSettings"]>[0]) =>
      useUIStore.getState().updateDebugSettings(settings),
    notify: (input: unknown) => {
      const { message, player } = NotifySchema.parse(input);
      useUIStore.getState().setNotification(message, player as PlayerType);
    },
  },
};