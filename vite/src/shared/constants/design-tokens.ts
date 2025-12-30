/**
 * Design Tokens
 * アプリケーション全体のビジュアル定数（色、サイズ、レイアウトなど）
 */

export const DESIGN = {
  // --- 盤面 (Field Grid) ---
  BOARD: {
    CELL_GAP: 1.0,
    CELL_SIZE: 0.9,
    // Field width/height はロジックにも絡むため GAME_SETTINGS を参照推奨だが、
    // 表示上のオフセット計算などで使うならここにあっても良い
    DEFAULT_ROTATION_X: -Math.PI / 2,
  },

  // --- マスの色 ---
  COLORS: {
    NATIVE_AREA: "#2E7D32",
    ALIEN_CORE: "#C62828",
    ALIEN_INVASION: "#E57373",
    EMPTY: "#757575",
    RECOVERY_PENDING: "#FDD835",
    DEFAULT_CELL: "#444444",
    EMISSIVE_DEFAULT: "black",
  },

  // --- 手札 (Hand) ---
  HAND: {
    CARDS_PER_PAGE: 3,
    CARD_WIDTH: 1.8,
    CARD_SPACING: 0.8,
    PAGE_TRANSITION_SPACING: 1,
    POSITION_Y: 2.2,
    Z_POS_VISIBLE: 3.5,
    Z_POS_HIDDEN: 6,
    TILT_ANGLE_BASE: Math.PI / 2.2,
    Y_ROTATION_BASE: Math.PI,
    CARD_SCALE: 1.25,
    // アニメーション設定
    ANIMATION: {
      Z_POS_SELECTED: -0.5,
      Z_POS_DEFAULT: 0,
      OPACITY_VISIBLE: 1,
      OPACITY_HIDDEN: 0.5,
      SPRING_TENSION: 300,
      SPRING_FRICTION: 20,
    },
    // ジェスチャー領域
    GESTURE: {
      WIDTH_PADDING: 4,
      ROTATION_X: -Math.PI / 2,
      POSITION_Y: -0.2,
      POSITION_Z: -0.15,
      FLICK_THRESHOLD: 45,
      DRAG_THRESHOLD: 10,
    },
  },
} as const;

// Helper to get page width based on tokens
export const getHandPageWidth = () => {
  return (
    DESIGN.HAND.CARDS_PER_PAGE * DESIGN.HAND.CARD_WIDTH +
    (DESIGN.HAND.CARDS_PER_PAGE - 1) * DESIGN.HAND.CARD_SPACING
  );
};
