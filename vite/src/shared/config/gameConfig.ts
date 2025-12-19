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

/** カメラと操作の初期設定 */
export const CAMERA_SETTINGS = {
  INITIAL_POSITION: [0, 15, 14] as [number, number, number],
  FOV: 70,
  /** ユーザーによるカメラ操作（回転・ズーム・移動）を禁止するか */
  LOCK_CONTROLS: true,
} as const;

/** 手札のレイアウトと挙動設定 */
export const HAND_LAYOUT = {
  /** カード間の距離 */
  CARD_SPACING: 2.2,
  /** 手札全体のZ座標（手前・奥） */
  Z_POSITION: 5,
  /** 画面端からのY座標オフセット */
  Y_OFFSET_FROM_EDGE: 1.0,
  /** スワイプ判定とみなす最小移動距離 (px) */
  SWIPE_THRESHOLD_DISTANCE: 50,
  /** スワイプ判定とみなす最小速度 */
  SWIPE_THRESHOLD_VELOCITY: 0.2,
  /** スワイプ判定エリア（ヒットボックス）のサイズ [幅, 高さ] */
  HITBOX_SIZE: [10, 4] as [number, number],
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

/** デバッグ用設定 */
export const DEBUG_SETTINGS = {
  /** 手札のスワイプ判定エリア（ヒットボックス）を半透明で表示するか */
  SHOW_SWIPE_AREA: false,
} as const;