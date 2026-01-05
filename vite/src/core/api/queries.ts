// vite/src/core/api/queries.ts
import { useGameStore } from "@/core/store/gameStore";
import { useUIStore } from "@/core/store/uiStore";
import { PlayerType } from "@/shared/types/game-schema";

/**
 * Feature向け 公開参照API (Queries) - React Hooks版
 */
export const useGameQuery = {
  /** Game State */
  useGameState: () => useGameStore((state) => state),
  useCurrentRound: () => useGameStore((state) => state.currentRound), // Fixed: Turn -> Round
  useActivePlayer: () => useGameStore((state) => state.activePlayerId),
  usePlayer: (playerId: PlayerType) =>
    useGameStore((state) => state.playerStates[playerId]),
  useField: () => useGameStore((state) => state.gameField),
  useCell: (x: number, y: number) =>
    useGameStore((state) => state.gameField.cells[y]?.[x]),
  useActiveAliens: () => useGameStore((state) => state.activeAlienInstances), // Added

  /** UI State */
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
  currentRound: () => useGameStore.getState().currentRound, // Fixed: Turn -> Round
  activePlayer: () => useGameStore.getState().activePlayerId,
  player: (playerId: PlayerType) =>
    useGameStore.getState().playerStates[playerId],
  field: () => useGameStore.getState().gameField,
  cell: (x: number, y: number) =>
    useGameStore.getState().gameField.cells[y]?.[x],
  activeAliens: () => useGameStore.getState().activeAlienInstances, // Added

  ui: {
    selectedCardId: () => useUIStore.getState().selectedCardId,
    selectedCell: () => useUIStore.getState().selectedCell,
  },
};