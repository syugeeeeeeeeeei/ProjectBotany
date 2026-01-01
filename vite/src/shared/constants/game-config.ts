/**
 * ゲーム設定定数 (GAME_SETTINGS)
 * フィールドサイズ、最大ターン数、機能フラグなどの「ゲームのルール」を一元管理
 */
export const GAME_SETTINGS = {
  /** フィールドの幅（マス数） */
  FIELD_WIDTH: 7,
  /** フィールドの高さ（マス数） */
  FIELD_HEIGHT: 10,
  /** ゲームの最大ターン数 */
  MAXIMUM_TURNS: 4,

  /** デバッグ設定 */
  DEBUG: {
    SHOW_GESTURE_AREA: false,
    LOG_EVENTS: true,
  },
};
