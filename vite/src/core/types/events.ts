import { ReactNode } from "react";
import { GameState, CellState, PlayerType } from "@/shared/types/game-schema";

/**
 * Core Event Map
 * システム内で発生する全イベントの型定義
 * mittの型制約(Record<string, unknown>)を満たすため、interfaceではなくtypeで定義する
 */
export type CoreEventMap = {
  // --- ライフサイクル (Notification) ---
  /** ゲーム初期化時 */
  GAME_INIT: GameState;
  /** ターン開始時 */
  TURN_START: GameState;
  /** ターン終了処理直前 (割り込み処理用) */
  BEFORE_TURN_END: GameState;
  /** ターン終了確定時 */
  TURN_END: GameState;
  /** ゲーム決着時 */
  GAME_OVER: { winner: PlayerType | null };

  // --- インタラクション (User Action) ---
  /** セルクリック (UI層からの通知) */
  CELL_CLICK: { cell: CellState };

  // --- システム要求 (Request) ---
  /** 盤面の再描画要求 */
  REQUEST_RENDER: void;
};

/**
 * UIスロット注入用のインターフェース
 * mitt等のイベントバスとは別に、値を返す必要がある処理のために定義
 */
export interface UISlotMap {
  /** セル上に表示するオーバーレイUI */
  RENDER_CELL_OVERLAY: (cell: CellState) => ReactNode;
  /** UIスロットへのコンポーネント注入 */
  RENDER_UI_SLOT: (slotId: string, player: PlayerType) => ReactNode;
}
