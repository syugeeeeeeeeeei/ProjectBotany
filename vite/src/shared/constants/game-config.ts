// vite/src/shared/constants/game-config.ts

/**
 * ゲーム設定定数 (GAME_SETTINGS)
 * フィールドサイズ、最大ラウンド数、機能フラグなどの「ゲームのルール」を一元管理
 */
export const GAME_SETTINGS = {
  /** フィールドの幅（マス数） */
  FIELD_WIDTH: 7,
  /** フィールドの高さ（マス数） */
  FIELD_HEIGHT: 10,
  /** ゲームの最大ラウンド数 */
  MAXIMUM_ROUNDS: 6,
  /** 初期AP */
  INITIAL_ENVIRONMENT: 1,

  /** デバッグ設定 */
  DEBUG: {
    SHOW_GESTURE_AREA: false,
    LOG_EVENTS: true,
  },
};