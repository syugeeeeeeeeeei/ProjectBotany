// vite/src/core/types/events.ts

import { PlayerId } from "@/shared/types/primitives";
import { GameState } from "@/shared/types/game-schema";

/**
 * ゲーム内で発生するイベントのマップ定義
 * key: イベント名
 * value: イベントのペイロード（引数）の型
 */
export interface CoreEventMap {
  // システム系
  GAME_INIT: void;

  // ラウンド進行
  ROUND_START: { round: number };
  ROUND_END: { round: number };

  // フェーズ進行
  PHASE_CHANGE: {
    from: GameState["currentPhase"];
    to: GameState["currentPhase"];
  };

  // アクション系
  PLAYER_ACTION_START: { playerId: PlayerId };
  PLAYER_ACTION_END: { playerId: PlayerId };

  // UI系 (オーバーレイ表示など)
  REQUEST_TOAST: { message: string; type: "info" | "error" | "success" };
}