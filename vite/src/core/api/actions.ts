// vite/src/core/api/actions.ts
import { RoundSystem } from "@/core/systems/RoundSystem";
import { useGameStore } from "@/core/store/gameStore";
import { useUIStore } from "@/core/store/uiStore";
import { CellType, CellState, PlayerType, GameState } from "@/shared/types"; // 修正: indexからインポート

/**
 * Feature向け 公開操作API (Commands)
 */
export const gameActions = {
  /** システム操作 */
  system: {
    reset: () => {
      useGameStore.getState().initializeGame();
    },
    updateState: (payload: Partial<GameState>) => { // 型循環回避のためany許容またはPartial<GameState>
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
    // 旧コード互換用 (next -> endへ誘導)
    next: () => {
      console.warn("Deprecated: gameActions.round.next() called. Use .end()");
      const currentState = useGameStore.getState();
      RoundSystem.endRoundProcess(currentState);
    }
  },

  /** 盤面操作 */
  field: {
    mutateCell: (x: number, y: number, type: CellType) => {
      // Step 2の簡易実装を維持、必要なら拡張
      console.log("Mutate cell:", x, y, type);
    },
  },

  /** UI操作 (ここが漏れていたためエラーになっていました) */
  ui: {
    selectCard: (cardId: string) => useUIStore.getState().selectCard(cardId),
    deselectCard: () => useUIStore.getState().deselectCard(),
    hoverCell: (cell: CellState | null) => useUIStore.getState().hoverCell(cell),
    notify: (message: string, player?: PlayerType) =>
      useUIStore.getState().setNotification(message, player),
  },
};