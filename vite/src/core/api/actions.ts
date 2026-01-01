import { TurnSystem } from "@/core/systems/TurnSystem";
import { FieldSystem } from "@/core/systems/FieldSystem";
import { useGameStore } from "@/core/store/gameStore";
import { useUIStore } from "@/core/store/uiStore";
import { CellType, CellState, PlayerType } from "@/shared/types/game-schema";
import { ActionLog } from "@/shared/types/actions";

// 簡易ID生成
const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Feature向け 公開操作API (Commands)
 */
export const gameActions = {
  /** ターン操作 */
  turn: {
    next: () => TurnSystem.advanceTurn(),
  },

  /** 盤面操作 */
  field: {
    mutateCell: (x: number, y: number, type: CellType) => {
      FieldSystem.setCellType(x, y, type);
    },
    updateCell: (x: number, y: number, updater: (cell: CellState) => void) => {
      FieldSystem.mutateCell(x, y, updater);
    },
  },

  /** UI操作 (新規追加) */
  ui: {
    selectCard: (cardId: string) => useUIStore.getState().selectCard(cardId),
    deselectCard: () => useUIStore.getState().deselectCard(),
    hoverCell: (cell: CellState | null) => useUIStore.getState().hoverCell(cell),
    notify: (message: string, player?: PlayerType) =>
      useUIStore.getState().setNotification(message, player),
  },

  /** 履歴操作 */
  history: {
    add: (type: string, payload: unknown) => {
      useGameStore.getState().internal_mutate((draft) => {
        const log: ActionLog = {
          actionId: generateId(),
          type,
          payload,
          timestamp: Date.now(),
          turn: draft.currentTurn,
        };
        draft.history.push(log);
        if (import.meta.env.DEV) {
          console.log(`📜 History Added: [${type}]`, payload);
        }
      });
    },
  },

  /** システム操作 */
  system: {
    reset: () => {
      useGameStore.getState().reset();
      FieldSystem.initializeField();
    },
  },
};