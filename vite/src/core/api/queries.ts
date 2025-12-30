import { useGameStore } from "@/core/store/gameStore";

/**
 * Feature向け 公開参照API (Queries)
 * コンポーネント内で使用するHooks
 */
export const useGameQuery = {
	/** 全体のGameStateを取得 */
	useGameState: () => useGameStore((state) => state),

	/** 現在のターン数を取得 */
	useCurrentTurn: () => useGameStore((state) => state.currentTurn),

	/** 現在のアクティブプレイヤーを取得 */
	useActivePlayer: () => useGameStore((state) => state.activePlayerId),

	/** 盤面データを取得 */
	useField: () => useGameStore((state) => state.gameField),

	/** 特定のセルを取得 */
	useCell: (x: number, y: number) => useGameStore((state) => state.gameField.cells[y]?.[x]),
};