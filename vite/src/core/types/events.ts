// vite/src/core/types/events.ts
import { ReactNode } from "react";
import { GameState, CellState, PlayerType } from "@/shared/types/game-schema";

/**
 * Core Event Map
 * システム内で発生する全イベントの型定義
 */
export type CoreEventMap = {
  // --- ライフサイクル (Notification) ---
  /** ゲーム初期化時 */
  GAME_INIT: GameState;

  // ラウンド/ターン進行
  /** ラウンド開始時 */
  ROUND_START: GameState;
  /** ターン開始時 (PlayerTypeを指定) */
  TURN_START: { playerId: PlayerType };
  /** ラウンド終了処理直前 (Featureの割り込み処理用) */
  BEFORE_ROUND_END: GameState;
  /** ターン終了前 (旧仕様との互換または細かいフック用) */
  BEFORE_TURN_END: GameState;
  /** ラウンド終了時 */
  ROUND_END: GameState;

  /** ゲーム決着時 */
  GAME_OVER: { winner: PlayerType | null };

  // --- インタラクション (User Action) ---
  /** セルクリック (UI層からの通知) */
  CELL_CLICK: { cell: CellState };
  /** カード使用 */
  PLAY_CARD: { cardId: string; targetX: number; targetY: number };

  // --- システム要求 (Request) ---
  /** 盤面の再描画要求 */
  REQUEST_RENDER: void;
};

/**
 * UIスロット注入用のインターフェース
 */
export interface UISlotMap {
  /** セル上に表示するオーバーレイUI */
  RENDER_CELL_OVERLAY: (cell: CellState) => ReactNode;
  /** UIスロットへのコンポーネント注入 */
  RENDER_UI_SLOT: (slotId: string, player: PlayerType) => ReactNode;
}