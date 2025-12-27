/**
 * ゲーム全体で共有される定数定義
 */
export const GAME_SETTINGS = {
  /** フィールドの幅（マス数） */
  FIELD_WIDTH: 7,
  /** フィールドの高さ（マス数） */
  FIELD_HEIGHT: 10,
  /** ゲームの最大ターン数 */
  MAXIMUM_TURNS: 4,
  /** 機能の有効/無効を制御するフラグ */
  FEATURE_FLAGS: {
    /** 外来種移動機能の有効化 */
    ENABLE_MOVE_ALIEN: true,
    /** カードプレイ機能の有効化 */
    ENABLE_PLAY_CARD: true,
    /** ターン進行機能の有効化 */
    ENABLE_TURN_SYSTEM: true,
  },
};
