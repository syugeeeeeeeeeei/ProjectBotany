import { DESIGN } from "@/shared/constants/design-tokens";

/**
 * カードの物理・レイアウト定義
 */
export const CardLayout = {
	// 1. 物理的な寸法 (Geometry)
	// ここで定義する WIDTH/HEIGHT が「一番下のRoundedBox（カード最大サイズ）」となる
	SIZE: {
		WIDTH: 2,
		HEIGHT: 3,
		THICKNESS: 0.1, // カード自体の厚み（RoundedBoxの深さ）
		RADIUS: 0.05,     // 角丸の半径
		BORDER_THICKNESS: 0.06, // 縁の太さ
	},

	// 2. 配置オフセット (Z-Positioning)
	// RoundedBoxの表面 (Z = THICKNESS / 2) を基準(0)とする
	Z_OFFSETS: {
		// Layer 1: RoundedBox (基準)

		// Layer 2: Base (台紙) - 表面からわずかに浮かせる
		BASE: 0.001,

		// Layer 3: Contents - Baseの上に配置
		HEADER_BG: 0.002,
		IMAGE_BG: 0.003,
		DESC_BG: 0.003,

		TEXT: 0.01,
		HIGHLIGHT: 0.02,
		OVERLAY: 0.05,
	},

	// 3. コンテンツの比率設定 (カード全幅に対する比率)
	RATIOS: {
		// Baseの内側に収まるように調整
		CONTENT_WIDTH: 0.85,
		DESC_WIDTH: 0.1,
		IMAGE_HEIGHT: 1,
	},

	// 4. ヘッダー形状パラメータ (S字ウェーブ型)
	HEADER_CURVE: {
		TOP_Y_OFFSET: 0.12,
		BEZIER_CONTROL_X_RATIO: 1 / 3,
		BEZIER_TANGENT_X_RATIO: 1 / 6,
		FIX: 0.1,
		PEAK: 0.05,
	},

	// 5. テキスト等の配置座標
	POS: {
		NAME_Y_FROM_TOP: 0.38,
		DESC_Y: -0.7,
		DESC_TEXT_Y_OFFSET: 0.52,
	},

	// 6. 色定義 (Feature固有)
	COLORS: {
		BORDER: "#B8860B", // DarkGoldenRod
		...DESIGN.COLORS,
	}
};

/**
 * 手札全体のレイアウト定義
 */
export const HandLayout = {
	CARDS_PER_PAGE: 3,
	CARD_SPACING: 0.8,
	PAGE_SPACING: 3, // 1ページ分のスペース。十分に大きく。

	CARD: {
		SCALE: 1.28,
		ROTATION: {
			X: (facingFactor: number) => (Math.PI / 2.2) * -facingFactor,
			Y: (facingFactor: number) => ((1 - facingFactor) / 2) * Math.PI,
			Z: 0,
		}
	},
	POSITION: {
		Y: 2.2,
		Z_VISIBLE: 3.5,
		Z_HIDDEN: 6.0,
	},

	GESTURE_AREA: {
		ROTATION: {
			X: -Math.PI / 2,
			Y: 0,
			Z: 0,
		},
		POSITION: {
			X: 0,
			Y: -0.2,
			Z: -0.15,
		},
	},
	ANIMATION: {
		Z_SELECTED: -0.5,
		Z_DEFAULT: 0,
	},

	getPageWidth() {
		return (
			this.CARDS_PER_PAGE * CardLayout.SIZE.WIDTH +
			(this.CARDS_PER_PAGE - 1) * this.CARD_SPACING
		);
	},
};

// 色定義はSharedから利用
export const CardColors = DESIGN.COLORS;