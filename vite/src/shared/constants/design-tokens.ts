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
      BASE_BG: "#e8e6dd",
      TEXT_WHITE: "#FFFFFF",
      TEXT_BLACK: "#000000",
      DESC_BG: "#FFFFFF",
    },
  },
} as const;
