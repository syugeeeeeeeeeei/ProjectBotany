import { TurnSystem } from "@/core/systems/TurnSystem";
import { FieldSystem } from "@/core/systems/FieldSystem";
import { useGameStore } from "@/core/store/gameStore";
import { CellType, CellState } from "@/shared/types/game-schema";
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

  /** 履歴操作 (追加) */
  history: {
    /**
     * アクションログを追加する
     * @param type アクション識別子 (Featureで定義)
     * @param payload アクション詳細データ (Featureで定義)
     */
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

        // 開発用ログ
        if (import.meta.env.DEV) {
          console.log(`📜 History Added: [${type}]`, payload);
        }
      });
    },
  },

  /** ゲーム全体 */
  system: {
    reset: () => {
      useGameStore.getState().reset();
      FieldSystem.initializeField();
    },
  },
};
