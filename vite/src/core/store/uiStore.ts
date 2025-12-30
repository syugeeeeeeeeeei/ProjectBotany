import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { CellState } from "@/shared/types/game-schema";

interface UIState {
	/** 選択中のセル */
	selectedCell: CellState | null;
	/** ホバー中のセル */
	hoveredCell: CellState | null;
	/** カードプレビューモードかどうか */
	isCardPreview: boolean;
	/** インタラクションロック（アニメーション中など） */
	isInteractionLocked: boolean;
}

interface UIActions {
	selectCell: (cell: CellState | null) => void;
	hoverCell: (cell: CellState | null) => void;
	setCardPreview: (isPreview: boolean) => void;
	setInteractionLock: (isLocked: boolean) => void;
	/** 選択解除のショートカット */
	deselectCard: () => void;
}

export const useUIStore = create(
	immer<UIState & UIActions>((set) => ({
		// State
		selectedCell: null,
		hoveredCell: null,
		isCardPreview: false,
		isInteractionLocked: false,

		// Actions
		selectCell: (cell) =>
			set((state) => {
				state.selectedCell = cell;
			}),
		hoverCell: (cell) =>
			set((state) => {
				state.hoveredCell = cell;
			}),
		setCardPreview: (isPreview) =>
			set((state) => {
				state.isCardPreview = isPreview;
			}),
		setInteractionLock: (isLocked) =>
			set((state) => {
				state.isInteractionLocked = isLocked;
			}),
		deselectCard: () =>
			set((state) => {
				state.selectedCell = null;
				state.isCardPreview = false;
			}),
	}))
);