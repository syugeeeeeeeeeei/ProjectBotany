/** ゲームの基本ルール設定 */
export const GAME_SETTINGS = {
  FIELD_WIDTH: 7,
  FIELD_HEIGHT: 10,
  MAXIMUM_TURNS: 6,
} as const;

/** 3D盤面のレイアウト設定 */
export const BOARD_LAYOUT = {
  CELL_GAP: 1.0,
  CELL_SIZE: 0.9,
  ROTATION_X: -Math.PI / 2,
} as const;

/** UI表示に関するタイマー設定 */
export const TIMERS = {
  TURN_BANNER_DELAY: 1000,
  TURN_BANNER_DURATION: 2000,
  NOTIFICATION_DURATION: 3000,
} as const;

/** 手札のページング設定 */
export const HAND_PAGING = {
  CARDS_PER_PAGE: 3,
} as const;