import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { PlayerType } from "@/shared/types/game-schema";

/**
 * UIの状態を管理するインターフェース
 */
interface UIState {
  /** 選択中のカードID */
  selectedCardId: string | null;
  /** 選択中の外来種インスタンスID */
  selectedAlienInstanceId: string | null;
  /** 各プレイヤーへの通知メッセージ */
  notifications: { [key in PlayerType]: string | null };
  /** カード配置のプレビュー座標 */
  previewPlacement: { x: number; y: number } | null;
  /** カードプレビューモード（ボタン表示切り替え用） */
  isCardPreview: boolean;
}

/**
 * UIの操作（アクション）を管理するインターフェース
 */
interface UIActions {
  selectCard: (cardId: string) => void;
  deselectCard: () => void;
  selectAlienInstance: (instanceId: string | null) => void;
  setNotification: (message: string | null, forPlayer: PlayerType) => void;
  setPreviewPlacement: (position: { x: number; y: number } | null) => void;
}

const DEFAULT_PREVIEW_POSITION = { x: 3, y: 5 };

export const useUIStore = create(
  immer<UIState & UIActions>((set) => ({
    selectedCardId: null,
    selectedAlienInstanceId: null,
    notifications: { native: null, alien: null },
    previewPlacement: null,
    isCardPreview: false,

    selectCard: (cardId) =>
      set((state) => {
        state.selectedCardId = cardId;
        state.selectedAlienInstanceId = null;
        state.previewPlacement = DEFAULT_PREVIEW_POSITION;
        state.isCardPreview = true;
      }),

    deselectCard: () =>
      set((state) => {
        state.selectedCardId = null;
        state.previewPlacement = null;
        state.isCardPreview = false;
      }),

    selectAlienInstance: (instanceId) =>
      set((state) => {
        state.selectedAlienInstanceId = instanceId;
        state.selectedCardId = null;
        state.previewPlacement = null;
        state.isCardPreview = false;
      }),

    setNotification: (message, forPlayer) =>
      set((state) => {
        state.notifications[forPlayer] = message;
      }),

    setPreviewPlacement: (position) =>
      set((state) => {
        state.previewPlacement = position;
      }),
  })),
);
