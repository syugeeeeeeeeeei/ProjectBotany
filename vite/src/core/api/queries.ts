import { useGameStore } from "@/core/store/gameStore";
import { PlayerType } from "@/shared/types/game-schema";

/**
 * Feature向け 公開参照API (Queries) - React Hooks版
 * ⚠️ コンポーネント内でのみ使用可能 (リアクティブに再描画される)
 */
export const useGameQuery = {
  /** 全体のGameStateを取得 */
  useGameState: () => useGameStore((state) => state),

  /** 現在のターン数を取得 */
  useCurrentTurn: () => useGameStore((state) => state.currentTurn),

  /** 現在のアクティブプレイヤーを取得 */
  useActivePlayer: () => useGameStore((state) => state.activePlayerId),

  /** 特定プレイヤーの状態を取得 */
  usePlayer: (playerId: PlayerType) =>
    useGameStore((state) => state.playerStates[playerId]),

  /** 盤面データを取得 */
  useField: () => useGameStore((state) => state.gameField),

  /** 特定のセルを取得 */
  useCell: (x: number, y: number) =>
    useGameStore((state) => state.gameField.cells[y]?.[x]),
};

/**
 * Feature向け 公開参照API (Queries) - Vanilla JS版
 * ✅ ロジックファイルやイベントリスナー内で使用可能 (その瞬間の値を取得)
 */
export const gameQuery = {
  /** 全体のGameStateを取得 */
  state: () => useGameStore.getState(),

  /** 現在のターン数を取得 */
  currentTurn: () => useGameStore.getState().currentTurn,

  /** 現在のアクティブプレイヤーを取得 */
  activePlayer: () => useGameStore.getState().activePlayerId,

  /** 特定プレイヤーの状態を取得 */
  player: (playerId: PlayerType) =>
    useGameStore.getState().playerStates[playerId],

  /** 盤面データを取得 */
  field: () => useGameStore.getState().gameField,

  /** 特定のセルを取得 */
  cell: (x: number, y: number) =>
    useGameStore.getState().gameField.cells[y]?.[x],
};
