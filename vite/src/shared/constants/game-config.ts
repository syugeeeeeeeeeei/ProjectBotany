/**
 * ゲーム設定定数 (GAME_SETTINGS)
 * ゲームのルール定義
 */
export const GAME_SETTINGS = {
  /** フィールドの幅（マス数） */
  FIELD_WIDTH: 7,
  /** フィールドの高さ（マス数） */
  FIELD_HEIGHT: 10,
  /** ゲームの最大ターン数 */
  MAXIMUM_TURNS: 4,
  /** 機能の有効/無効を制御するフラグ (リファクタリング中は固定) */
  FEATURE_FLAGS: {
    ENABLE_MOVE_ALIEN: true,
    ENABLE_PLAY_CARD: true,
    ENABLE_TURN_SYSTEM: true,
  },
};
