import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { v4 as uuidv4 } from "uuid";
import { CellState, PlayerType } from "@/shared/types";

// 通知の型定義
export interface NotificationItem {
  id: string;
  message: string;
  type: "info" | "error" | "success" | "system";
  player?: PlayerType; // どちらのプレイヤーに対する通知か（省略時はシステム全体）
  timestamp: number;
}

interface UIState {
  /** 選択中のセル */
  selectedCell: CellState | null;
  /** ホバー中のセル */
  hoveredCell: CellState | null;
  /** 選択中のカードID (インスタンスID) */
  selectedCardId: string | null;

  /** ✨ 通知スタック (最大3件) */
  notifications: NotificationItem[];

  /** カードプレビューモードかどうか */
  isCardPreview: boolean;
  /** インタラクションロック */
  isInteractionLocked: boolean;

  /** デバッグ設定 */
  debugSettings: {
    showGestureArea: boolean;
  };
}

interface UIActions {
  selectCell: (cell: CellState | null) => void;
  hoverCell: (cell: CellState | null) => void;
  selectCard: (cardId: string | null) => void;

  /** ✨ 通知を追加 */
  pushNotification: (message: string, type?: NotificationItem["type"], player?: PlayerType) => void;
  /** ✨ 通知を削除 */
  removeNotification: (id: string) => void;

  setCardPreview: (isPreview: boolean) => void;
  setInteractionLock: (isLocked: boolean) => void;
  deselectCard: () => void;
  updateDebugSettings: (settings: Partial<UIState["debugSettings"]>) => void;
}

export const useUIStore = create(
  immer<UIState & UIActions>((set) => ({
    // State
    selectedCell: null,
    hoveredCell: null,
    selectedCardId: null,
    notifications: [],
    isCardPreview: false,
    isInteractionLocked: false,

    debugSettings: {
      showGestureArea: false,
    },

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
        state.selectedCell = null;
      }),

    // ✨ 通知ロジック
    pushNotification: (message, type = "info", player) =>
      set((state) => {
        const newItem: NotificationItem = {
          id: uuidv4(),
          message,
          type,
          player,
          timestamp: Date.now(),
        };
        // 新しいものを先頭に追加し、最大3件に制限
        state.notifications = [newItem, ...state.notifications].slice(0, 3);
      }),

    removeNotification: (id) =>
      set((state) => {
        state.notifications = state.notifications.filter((n) => n.id !== id);
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

    updateDebugSettings: (settings) =>
      set((state) => {
        state.debugSettings = { ...state.debugSettings, ...settings };
      }),
  })),
);