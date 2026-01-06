// vite/src/core/api/actions.ts
import { z } from "zod";
import { RoundSystem } from "@/core/systems/RoundSystem";
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
 * Zodによるランタイムバリデーションを適用
 */
export const gameActions = {
  /** システム操作 */
  system: {
    reset: () => {
      useGameStore.getState().initializeGame();
    },
    updateState: (payload: Partial<GameState>) => {
      // 厳密なチェックが必要な場合はここにZodスキーマを追加
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
    next: () => {
      console.warn("Deprecated: gameActions.round.next() called. Use .end()");
      const currentState = useGameStore.getState();
      RoundSystem.endRoundProcess(currentState);
    }
  },

  /** 盤面操作 */
  field: {
    mutateCell: (input: unknown) => {
      // ランタイムバリデーション
      const { x, y, type } = MutateCellSchema.parse(input);
      console.log("Safe Mutate:", x, y, type);
      // 実装ロジックがあればここに記述
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
    notify: (input: unknown) => {
      const { message, player } = NotifySchema.parse(input);
      useUIStore.getState().setNotification(message, player as PlayerType);
    },
  },
};