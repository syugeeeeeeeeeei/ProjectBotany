import { useGameStore } from "@/core/store/gameStore";
import { useUIStore } from "@/core/store/uiStore";
import { PlayerType } from "@/shared/types/game-schema";

/**
 * Feature向け 公開参照API (Queries) - React Hooks版
 */
export const useGameQuery = {
  /** Game State */
  useGameState: () => useGameStore((state) => state),
  useCurrentTurn: () => useGameStore((state) => state.currentTurn),
  useActivePlayer: () => useGameStore((state) => state.activePlayerId),
  usePlayer: (playerId: PlayerType) =>
    useGameStore((state) => state.playerStates[playerId]),
  useField: () => useGameStore((state) => state.gameField),
  useCell: (x: number, y: number) =>
    useGameStore((state) => state.gameField.cells[y]?.[x]),

  /** UI State (新規追加) */
  ui: {
    useSelectedCardId: () => useUIStore((state) => state.selectedCardId),
    useSelectedCell: () => useUIStore((state) => state.selectedCell),
    useIsInteractionLocked: () =>
      useUIStore((state) => state.isInteractionLocked),
    useNotification: () => useUIStore((state) => state.notification),
  },
};

/**
 * Feature向け 公開参照API (Queries) - Vanilla JS版
 */
export const gameQuery = {
  state: () => useGameStore.getState(),
  currentTurn: () => useGameStore.getState().currentTurn,
  activePlayer: () => useGameStore.getState().activePlayerId,
  player: (playerId: PlayerType) =>
    useGameStore.getState().playerStates[playerId],
  field: () => useGameStore.getState().gameField,
  cell: (x: number, y: number) =>
    useGameStore.getState().gameField.cells[y]?.[x],

  ui: {
    selectedCardId: () => useUIStore.getState().selectedCardId,
    selectedCell: () => useUIStore.getState().selectedCell,
  },
};
