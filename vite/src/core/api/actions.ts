// vite/src/core/api/actions.ts
import { RoundSystem } from "@/core/systems/RoundSystem";
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
  /** 進行操作 */
  round: {
    /** 現在のターンを終了し、次へ進める */
    next: () => RoundSystem.endCurrentTurn(),
  },

  /** 盤面操作 */
  field: {
    /** 指定座標のセルタイプを変更する (簡易版) */
    mutateCell: (x: number, y: number, type: CellType) => {
      useGameStore.getState().internal_mutate((draft) => {
        // FieldSystemのFactoryを使用して適切な初期状態のセルを生成して代入
        switch (type) {
          case "native_area":
            draft.gameField.cells[y][x] = FieldSystem.createNativeCell(x, y);
            break;
          case "bare_ground_area":
            draft.gameField.cells[y][x] = FieldSystem.createBareGroundCell(x, y);
            break;
          // ※他のタイプが必要な場合は引数を拡張する必要あり
          default:
            console.warn("mutateCell: Unsupported simple type mutation", type);
            break;
        }
      });
    },
    /** 指定座標のセルを直接更新する */
    updateCell: (x: number, y: number, updater: (cell: CellState) => void) => {
      useGameStore.getState().internal_mutate((draft) => {
        const cell = draft.gameField.cells[y]?.[x];
        if (cell) {
          updater(cell);
        }
      });
    },
  },

  /** UI操作 */
  ui: {
    selectCard: (cardId: string) => useUIStore.getState().selectCard(cardId),
    deselectCard: () => useUIStore.getState().deselectCard(),
    hoverCell: (cell: CellState | null) =>
      useUIStore.getState().hoverCell(cell),
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
          round: draft.currentRound, // Fixed: Turn -> Round
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
      // Storeのリセット
      useGameStore.getState().reset();

      // フィールドの再生成
      useGameStore.getState().internal_mutate((draft) => {
        draft.gameField = FieldSystem.initField();
      });

      // ゲーム開始
      RoundSystem.startGame();
    },
  },
};