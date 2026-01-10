// src/core/api/actions.ts
import { z } from "zod";
import { RoundSystem } from "@/core/systems/RoundSystem";
import { TurnSystem } from "@/core/systems/TurnSystem";
import { useGameStore } from "@/core/store/gameStore";
import { useUIStore, NotifyProps } from "@/core/store/uiStore"; // ✨ 修正: NotifyPropsをインポート
import { CellState, GameState } from "@/shared/types";
import { AlertSystem } from "../systems/AlertSystem";

// --- Validation Schemas ---
const MutateCellSchema = z.object({
  x: z.number(),
  y: z.number(),
  type: z.enum(["native", "alien", "bare", "pioneer"]),
});

// NotifyPropsの型定義に合わせたZodスキーマ
const NotifySchema = z.object({
  message: z.string(),
  type: z.enum(["info", "error", "success", "system"]).optional(),
  target: z.enum(["native", "alien", "broadcast", "current"]).optional(),
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
    hoverCell: (cell: CellState | null) =>
      useUIStore.getState().hoverCell(cell),

    updateDebugSettings: (
      settings: Parameters<
        ReturnType<typeof useUIStore.getState>["updateDebugSettings"]
      >[0]
    ) => useUIStore.getState().updateDebugSettings(settings),

    /** ✨ 修正: NotifyProps型を受け取り、型安全にする */
    notify: (input: NotifyProps) => {
      // ランタイムバリデーション（念のため）
      const { message, type, target } = NotifySchema.parse(input);

      // AlertSystemへ委譲
      // targetがundefinedの場合、AlertSystem.notifyのデフォルト引数(current)が適用される
      AlertSystem.notify(
        message,
        type as "info" | "error" | "success" | "system",
        target as "native" | "alien" | "broadcast" | "current"
      );
    },
  },
};