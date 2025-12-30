import { TurnSystem } from "@/core/systems/TurnSystem";
import { FieldSystem } from "@/core/systems/FieldSystem";
import { useGameStore } from "@/core/store/gameStore";
import { CellType, CellState } from "@/shared/types/game-schema";

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
		/** * セルの種類を変更する (破壊、再生など)
		 */
		mutateCell: (x: number, y: number, type: CellType) => {
			FieldSystem.setCellType(x, y, type);
		},

		/**
		 * 任意の更新関数でセルを操作する
		 */
		updateCell: (x: number, y: number, updater: (cell: CellState) => void) => {
			FieldSystem.mutateCell(x, y, updater);
		}
	},

	/** ゲーム全体 */
	system: {
		reset: () => {
			useGameStore.getState().reset();
			FieldSystem.initializeField();
		}
	}
};