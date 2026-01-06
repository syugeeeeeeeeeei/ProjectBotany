// vite/src/core/api/queries.ts
import { useGameStore } from "@/core/store/gameStore";
import { useUIStore } from "@/core/store/uiStore";
import { PlayerType, PlayerId } from "@/shared/types"; // 修正: indexからインポート

/**
 * Feature向け 公開参照API (Queries) - React Hooks版
 */
export const useGameQuery = {
  /** Game State */
  useGameState: () => useGameStore((state) => state),
  useCurrentRound: () => useGameStore((state) => state.currentRound),
  useActivePlayer: () => useGameStore((state) => state.activePlayerId),
  usePlayer: (playerId: PlayerType) =>
    useGameStore((state) => state.playerStates[playerId as PlayerId]),
  useField: () => useGameStore((state) => state.gameField),
  useCell: (x: number, y: number) =>
    useGameStore((state) => state.gameField.cells[y]?.[x]),

  // ✨ 追加: スコア取得用フック
  useScore: (playerId: PlayerType) =>
    useGameStore((state) => (playerId === "native" ? state.nativeScore : state.alienScore)),

  // 修正: activeAlienInstances -> alienInstances (そのまま返す)
  useActiveAliens: () => useGameStore((state) => state.alienInstances),

  /** UI State */
  ui: {
    useSelectedCardId: () => useUIStore((state) => state.selectedCardId),
    useSelectedCell: () => useUIStore((state) => state.selectedCell),
    useIsInteractionLocked: () => useUIStore((state) => state.isInteractionLocked),
    useNotification: () => useUIStore((state) => state.notification),
  },
};

export const gameQuery = {
  state: () => useGameStore.getState(),
  currentRound: () => useGameStore.getState().currentRound,
  activePlayer: () => useGameStore.getState().activePlayerId,
  player: (playerId: PlayerType) =>
    useGameStore.getState().playerStates[playerId as PlayerId],
  field: () => useGameStore.getState().gameField,
  cell: (x: number, y: number) =>
    useGameStore.getState().gameField.cells[y]?.[x],

  // ✨ 追加: スコア取得用メソッド
  score: (playerId: PlayerType) => {
    const state = useGameStore.getState();
    return playerId === "native" ? state.nativeScore : state.alienScore;
  },

  // 修正
  activeAliens: () => useGameStore.getState().alienInstances,

  ui: {
    selectedCardId: () => useUIStore.getState().selectedCardId,
    selectedCell: () => useUIStore.getState().selectedCell,
  },
};