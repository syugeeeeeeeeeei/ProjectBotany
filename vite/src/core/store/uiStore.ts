import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { CellState, PlayerType } from "@/shared/types/game-schema";

interface UIState {
  /** 選択中のセル */
  selectedCell: CellState | null;
  /** ホバー中のセル */
  hoveredCell: CellState | null;
  /** 選択中のカードID (インスタンスID) */
  selectedCardId: string | null;
  /** 画面通知メッセージ */
  notification: { message: string; player?: PlayerType } | null;
  /** カードプレビューモードかどうか */
  isCardPreview: boolean;
  /** インタラクションロック */
  isInteractionLocked: boolean;
}

interface UIActions {
  selectCell: (cell: CellState | null) => void;
  hoverCell: (cell: CellState | null) => void;
  selectCard: (cardId: string | null) => void;
  setNotification: (message: string, player?: PlayerType) => void;
  clearNotification: () => void;
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
    selectedCardId: null,
    notification: null,
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
    selectCard: (cardId) =>
      set((state) => {
        state.selectedCardId = cardId;
        // カード選択時はセル選択を解除するなどの排他制御もここで可能
        state.selectedCell = null;
      }),
    setNotification: (message, player) =>
      set((state) => {
        state.notification = { message, player };
      }),
    clearNotification: () =>
      set((state) => {
        state.notification = null;
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
        state.selectedCardId = null;
        state.selectedCell = null;
        state.isCardPreview = false;
      }),
  })),
);
