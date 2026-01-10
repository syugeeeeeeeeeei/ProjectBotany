// vite/src/core/store/uiStore.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { v4 as uuidv4 } from "uuid";
import { CellState } from "@/shared/types";

// 通知のターゲット定義
export type NotificationTarget = "alien" | "native" | "broadcast";

// 通知アクション用のProps型定義
export interface NotifyProps {
  message: string;
  type?: "info" | "error" | "success" | "system";
  /** * 通知の表示先 
   * - undefined / 'current': 現在のターンプレイヤー (デフォルト)
   * - 'alien' / 'native': 指定プレイヤーのみ
   * - 'broadcast': 全員
   */
  target?: "alien" | "native" | "broadcast" | "current";
}

// 通知の型定義
export interface NotificationItem {
  id: string;
  message: string;
  type: "info" | "error" | "success" | "system";
  target: NotificationTarget;
  timestamp: number;
}

interface UIState {
  /** 選択中のセル */
  selectedCell: CellState | null;
  /** ホバー中のセル */
  hoveredCell: CellState | null;
  /** 選択中のカードID (インスタンスID) */
  selectedCardId: string | null;

  /** 配置可能状態かどうか (1秒ホバー制限用) */
  isHoverValid: boolean;

  /** 通知スタック (最大3件) */
  notifications: NotificationItem[];

  /** カードプレビューモードかどうか */
  isCardPreview: boolean;
  /** インタラクションロック */
  isInteractionLocked: boolean;

  /** デバッグ設定 */
  debugSettings: {
    showGestureArea: boolean;
    showFps: boolean;
  };
}

interface UIActions {
  selectCell: (cell: CellState | null) => void;
  hoverCell: (cell: CellState | null) => void;
  selectCard: (cardId: string | null) => void;

  /** 配置可能フラグを設定 */
  setHoverValid: (isValid: boolean) => void;

  /** 通知を追加 */
  pushNotification: (
    message: string,
    type?: NotificationItem["type"],
    target?: NotificationTarget
  ) => void;

  /** 通知を削除 */
  removeNotification: (id: string) => void;
  /** 全ての通知を削除 */
  clearNotifications: () => void;

  setCardPreview: (isPreview: boolean) => void;
  setInteractionLock: (isLocked: boolean) => void;
  deselectCard: () => void;
  updateDebugSettings: (settings: Partial<UIState["debugSettings"]>) => void;

  /** UI状態をリセットする */
  reset: () => void;
}

// 初期状態を定数として定義
const INITIAL_STATE: UIState = {
  selectedCell: null,
  hoveredCell: null,
  selectedCardId: null,
  isHoverValid: false,
  notifications: [],
  isCardPreview: false,
  isInteractionLocked: false,
  debugSettings: {
    showGestureArea: false,
    showFps: false,
  },
};

export const useUIStore = create(
  immer<UIState & UIActions>((set) => ({
    // State (Spread initial state)
    ...INITIAL_STATE,

    // Actions
    selectCell: (cell) =>
      set((state) => {
        state.selectedCell = cell;
      }),
    hoverCell: (cell) =>
      set((state) => {
        state.hoveredCell = cell;
        if (cell === null) {
          state.isHoverValid = false;
        }
      }),
    selectCard: (cardId) =>
      set((state) => {
        state.selectedCardId = cardId;
        state.selectedCell = null;
        state.isHoverValid = false;
      }),

    setHoverValid: (isValid) =>
      set((state) => {
        state.isHoverValid = isValid;
      }),

    // 通知ロジック
    pushNotification: (message, type = "info", target = "broadcast") =>
      set((state) => {
        const newItem: NotificationItem = {
          id: uuidv4(),
          message,
          type,
          target,
          timestamp: Date.now(),
        };
        // 新しいものを先頭に追加し、最大3件に制限
        state.notifications = [newItem, ...state.notifications].slice(0, 3);
      }),

    removeNotification: (id) =>
      set((state) => {
        state.notifications = state.notifications.filter((n) => n.id !== id);
      }),

    clearNotifications: () =>
      set((state) => {
        state.notifications = [];
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
        state.isHoverValid = false;
      }),

    updateDebugSettings: (settings) =>
      set((state) => {
        state.debugSettings = { ...state.debugSettings, ...settings };
      }),

    // ✨ 追加: 全状態をリセット
    reset: () => set(INITIAL_STATE),
  }))
);