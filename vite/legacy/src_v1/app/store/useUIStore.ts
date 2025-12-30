import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { PlayerType } from "@/shared/types/game-schema";

/**
 * Project Botany UI状態ストア（useUIStore）
 * 
 * 【動機】
 * ゲームの進行（ロジック）とは独立した、純粋な「表示状態」や「選択状態」を管理するためです。
 * カードの選択状況や通知、プレビューの位置など、一時的なUIの状態をゲームロジックのステートから
 * 切り離すことで、コンポーネントの再レンダリングを最適化し、責務を明確にします。
 *
 * 【恩恵】
 * - ゲームコアの状態を汚さずに、UI特有の状態（どのカードが光っているか、など）を全コンポーネントで共有できます。
 * - 選択解除（`deselectCard`）などの定型的なUI操作をカプセル化し、呼び出し側を簡潔に保てます。
 * - 通知（Notification）システムを一元化し、時間経過による消去などの制御を容易にします。
 *
 * 【使用法】
 * 1. コンポーネント内で `const ui = useUIStore()` として呼び出します。
 * 2. UIのイベントハンドラ（クリックなど）で `ui.selectCard(id)` や `ui.deselectCard()` を実行します。
 */

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

    /**
     * カードを選択し、配置プレビューモードを開始する
     * 手順：カードIDを保持し、初期配置ガイド（プレビュー）を表示するために必要です
     */
    selectCard: (cardId) =>
      set((state) => {
        state.selectedCardId = cardId;
        state.selectedAlienInstanceId = null; // 排他選択
        state.previewPlacement = DEFAULT_PREVIEW_POSITION;
        state.isCardPreview = true;
      }),

    /**
     * 全ての選択状態を解除し、プレビューを終了する
     */
    deselectCard: () =>
      set((state) => {
        state.selectedCardId = null;
        state.previewPlacement = null;
        state.isCardPreview = false;
      }),

    /**
     * 盤面上の外来種インスタンスを選択する（移動モードなど）
     */
    selectAlienInstance: (instanceId) =>
      set((state) => {
        state.selectedAlienInstanceId = instanceId;
        state.selectedCardId = null; // 排他選択
        state.previewPlacement = null;
        state.isCardPreview = false;
      }),

    /**
     * 指定したプレイヤーに対して通知を表示する
     */
    setNotification: (message, forPlayer) =>
      set((state) => {
        state.notifications[forPlayer] = message;
      }),

    /**
     * プレビューオブジェクトの表示座標を更新する
     * ドラッグ操作などによる配置位置の変更を追跡するために必要です
     */
    setPreviewPlacement: (position) =>
      set((state) => {
        state.previewPlacement = position;
      }),
  })),
);
