/**
 * Design Tokens
 * アプリケーション全体のビジュアル定数（色、サイズ、レイアウト、アニメーション設定）
 */

export const DESIGN = {
  // --- 盤面 (Field Grid) ---
  BOARD: {
    CELL_GAP: 1.0,
    CELL_SIZE: 0.9,
    DEFAULT_ROTATION_X: -Math.PI / 2,
  },

  // --- カラーパレット (Cells, HUD, Alerts, Card Types) ---
  COLORS: {
    // セル用
    NATIVE_AREA: "#2E7D32",
    ALIEN_CORE: "#C62828",
    ALIEN_INVASION: "#E57373",
    EMPTY: "#757575",
    RECOVERY_PENDING: "#FDD835",
    DEFAULT_CELL: "#444444",
    EMISSIVE_DEFAULT: "black",

    // HUD・UI用
    HUD_BG: "rgba(0, 0, 0, 0.6)",
    HUD_TEXT: "#FFFFFF",
    ALERT_ERROR: "#FF5252",
    ALERT_SUCCESS: "#4CAF50",
    NATIVE_THEME: "#2E7D32",
    ALIEN_THEME: "#C62828",

    // カードタイプ別カラー
    CARD_TYPES: {
      ALIEN: "#A00000",
      ERADICATION: "#005080",
      RECOVERY: "#207030",
      DEFAULT: "#555555",
    },

    // カード共通UIカラー
    CARD_UI: {
      BORDER_DEFAULT: "#B8860B",
      BORDER_HOVER: "#FAD02C",
      BORDER_SELECTED: "#FFD700",
      BASE_BG: "#F5EFE6",
      TEXT_WHITE: "#FFFFFF",
      TEXT_BLACK: "#000000",
      DESC_BG: "#FFFFFF",
    },
  },

  // --- カード詳細デザイン (Legacy Card3D.tsx 準拠) ---
  CARD: {
    WIDTH: 1.8,
    HEIGHT: 2.7,
    RADIUS: 0.04,
    BASE_DEPTH: 0.1,
    LAYER_DEPTHS: {
      BORDER: 0.08, // 0.1 - 0.02
      BASE: 0.1,
      HEADER: 0.051,       // 0.1 / 2 + 0.001
      IMAGE: 0.053,        // 0.1 / 2 + 0.003
      DESCRIPTION: 0.0515,  // 0.1 / 2 + 0.0015
      COOLDOWN_OVERLAY: 0.06,
      COOLDOWN_TEXT: 0.07,
    },
    HEADER: {
      HEIGHT: 0.43,
      TOP_Y_OFFSET: 0.05,
      BEZIER_CONTROL_X_RATIO: 1 / 3,
      BEZIER_TANGENT_X_RATIO: 1 / 6,
    },
    COST_CIRCLE: {
      RADIUS: 0.13,
      X_OFFSET_RATIO: 0.5,
      Y_OFFSET: 0.15,
      TEXT_FONT_SIZE: 0.16,
    },
    IMAGE_AREA: {
      Y_POSITION: 0.4,
    },
    DESCRIPTION_AREA: {
      Y_POSITION: -0.68,
      HEIGHT: 1.15,
      BG_HEIGHT: 1.2,
      TEXT_Y_OFFSET: 0.52,
      TEXT_FONT_SIZE: 0.095,
      LINE_HEIGHT: 1.2,
    },
    NAME_TEXT: {
      Y_OFFSET_RATIO: 0.5,
      Y_OFFSET_FIXED: 0.3,
      FONT_SIZE: 0.14,
    },
    // 配置・重なり補正用オフセット
    OFFSET: {
      Z_STEP: 0.01,
      Z_IMAGE: 0.003,
      Z_TEXT: 0.01,
      Z_HEADER_TEXT: 0.01,
      Z_DESC_TEXT: 0.01,
      HEADER_CURVE_FIX: 0.1,
      HEADER_CURVE_PEAK: 0.05,
    },
    // コンテンツ比率・スケーリング
    SCALE: {
      CONTENT_WIDTH_RATIO: 0.9,
      DESC_WIDTH_RATIO: 0.8,
      IMAGE_HEIGHT: 0.9,
      BORDER_GROWTH: 0.1,
    },
  },

  // --- 手札レイアウトと操作 (Legacy Hand3D.tsx 準拠) ---
  HAND: {
    CARDS_PER_PAGE: 3,
    CARD_WIDTH: 1.8,
    CARD_SPACING: 0.9,
    PAGE_TRANSITION_SPACING: 1,
    POSITION_Y: 2.2,
    Z_POSITIONS: {
      VISIBLE: 3.5,
      HIDDEN: 6,
    },
    TILT_ANGLE_BASE: Math.PI / 2.2,
    Y_ROTATION_BASE: Math.PI, // 在来種サイドのカード裏返しに使用
    CARD_SCALE: 1.28,
    // ジェスチャー判定用面
    GESTURE_PLANE: {
      WIDTH_PADDING: 4,
      ROTATION_X: -Math.PI / 2,
      POSITION_Y: -0.2,
      POSITION_Z: -0.15,
    },
    // アニメーション設定
    ANIMATION: {
      Z_POS_SELECTED: -0.5,
      Z_POS_DEFAULT: 0,
      OPACITY_VISIBLE: 1,
      OPACITY_HIDDEN: 0.5,
      SPRING_CONFIG: { tension: 300, friction: 20 },
      PAGE_TRANSITION: { tension: 300, friction: 30 },
    },
    // ジェスチャー閾値
    GESTURE_THRESHOLDS: {
      FLICK_DISTANCE: 45,
      DRAG: 10,
      FLICK_VELOCITY_DEFAULT: 0.5,
    },
  },
} as const;

/**
 * ページ幅の計算ユーティリティ (Hand3Dで使用)
 */
export const getHandPageWidth = () => {
  return (
    DESIGN.HAND.CARDS_PER_PAGE * DESIGN.HAND.CARD_WIDTH +
    (DESIGN.HAND.CARDS_PER_PAGE - 1) * DESIGN.HAND.CARD_SPACING
  );
};