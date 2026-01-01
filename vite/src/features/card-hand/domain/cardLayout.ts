// src/shared/constants/cardLayout.ts
import { DESIGN } from "@/shared/constants/design-tokens";

/**
 * Card 3D Layout Tokens
 * - 3Dカードの寸法/レイヤー順/配置/タイポグラフィなど、描画に必要な「不変の定数」と
 *   そこから導出できる「派生値」をまとめる。
 *
 * NOTE:
 * - Card3D は静的コンポーネント運用前提のため、基本幅は BASE.WIDTH を使用する。
 * - 外部入力（可変幅）が必要になった場合でも、calc(width) を通すことで一箇所で調整できる。
 */
export const CardLayout = {
	// --- 1) Base physical size ---
	BASE: {
		WIDTH: 1.8,
		HEIGHT: 2.7,
		THICKNESS: 0.05,
		CORNER_RADIUS: 0.1,

		BORDER_THICKNESS: 0.06,
	},

	// --- 2) Z layering offsets (on top of surfaceZ) ---
	Z: {
		BASE_BG: 0.001,
		HEADER_BG: 0.002,
		IMAGE_BG: 0.003,
		DESC_BG: 0.003,
		COST_BG: 0.004,
		TEXT: 0.01,
		HIGHLIGHT: 0.02,
		OVERLAY: 0.05,
	},

	// --- 3) Ratios ---
	RATIOS: {
		CONTENT_WIDTH: 0.85,
		DESC_WIDTH: 0.75,
		IMAGE_PLANE_HEIGHT: 0.9,
	},

	// --- 4) Component specific layout ---
	COMPONENTS: {
		// RoundedBox border/body
		BORDER_BOX: {
			WIDTH: 1.8,
			HEIGHT: 2.7,
			THICKNESS: 0.05,
		},

		HEADER: {
			TOP_Y_OFFSET: 0.05,
			BEZIER_CONTROL_X_RATIO: 1 / 3,
			BEZIER_TANGENT_X_RATIO: 1 / 6,
			SIDE_EDGE_FIX: 0.1,
			PEAK_AMPLITUDE: 0.05,
		},

		TEXT: {
			NAME: {
				Y_FROM_TOP: 0.35,
				FONT_SIZE: 0.14,
			},
			DESC: {
				GROUP_Y: -0.68,
				TEXT_Y_OFFSET: 0.52,
				FONT_SIZE: 0.095,
				LINE_HEIGHT: 1.2,
			},
			COOLDOWN: {
				FONT_SIZE: 0.5,
				Z_IN_OVERLAY: 0.01,
			},
		},

		IMAGE: {
			GROUP_Y: 0.4,
		},

		DESC_PANEL: {
			PLANE_HEIGHT: 1.15,
		},

		OVERLAY: {
			OPACITY: 0.6,
			COLOR: "gray",
		},
	},

	// --- 5) Colors ---
	COLORS: {
		BORDER: "#B8860B",
		...DESIGN.COLORS,
	},

	/**
	 * 派生値の計算（widthを差し替えたくなった時もここで吸収）
	 */
	calc(width: number) {
		const { BASE } = this;

		const surfaceZ = BASE.THICKNESS / 2;

		const innerWidth = width - BASE.BORDER_THICKNESS * 2;
		const innerHeight = BASE.HEIGHT - BASE.BORDER_THICKNESS * 2;

		const innerCornerRadius = Math.max(
			0,
			BASE.CORNER_RADIUS - BASE.BORDER_THICKNESS / 2,
		);

		return {
			surfaceZ,
			innerWidth,
			innerHeight,
			innerCornerRadius,
		};
	},
} as const;

/**
 * Hand (cards list) Layout Tokens
 * - “不変の数字” + “意味のある派生計算”をここに集約する。
 */
export const HandLayout = {
	// --- pagination ---
	CARDS_PER_PAGE: 3,
	CARD_GAP_X: 0.8,
	PAGE_GAP_X: 3, // 1ページ分のスペース。十分に大きく。

	// --- base placement ---
	POSITION: {
		X: 0,
		Y: 2.2,
		Z: {
			VISIBLE: 3.5,
			HIDDEN: 6.0,
		},
	},

	// --- card transform in hand ---
	CARD: {
		SCALE: 1.28,
		ROTATION: {
			X: (facingFactor: number) => (Math.PI / 2.2) * -facingFactor,
			Y: (facingFactor: number) => ((1 - facingFactor) / 2) * Math.PI,
			Z: 0,
		},
	},

	// --- gesture plane ---
	GESTURE: {
		PLANE_PADDING_X: 4, // pageWidth に足す余白
		PLANE_HEIGHT: 4,

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
		MATERIAL: {
			OPACITY: 0,
			DEPTH_WRITE: false,
		},
	},

	// --- animation values ---
	ANIMATION: {
		Z_SELECTED: -0.5,
		Z_DEFAULT: 0,
		SPRING_CONFIG: { tension: 300, friction: 20 },
		OPACITY_DIM: 0.5, // 見えない/非選択の暗転
	},

	// -------- Derived Values / Helpers --------

	/** 1ページ分の横幅 */
	get PAGE_WIDTH() {
		return (
			this.CARDS_PER_PAGE * CardLayout.BASE.WIDTH +
			(this.CARDS_PER_PAGE - 1) * this.CARD_GAP_X
		);
	},

	/** カードのローカルX（page内） */
	calcCardXLocal(index: number, facingFactor: number) {
		const pageWidth = this.PAGE_WIDTH;
		const cardWidth = CardLayout.BASE.WIDTH;
		const gap = this.CARD_GAP_X;

		// 左端基準 → 中央揃え
		const x =
			-pageWidth / 2 + index * (cardWidth + gap) + cardWidth / 2;

		return x * facingFactor;
	},

	/** 表示状態からターゲットopacityを決定 */
	calcTargetOpacity(params: {
		isVisible: boolean;
		isAnySelected: boolean;
		isSelected: boolean;
	}) {
		const { isVisible, isAnySelected, isSelected } = params;
		const dim = this.ANIMATION.OPACITY_DIM;

		if (!isVisible) return dim;
		if (!isAnySelected) return 1;
		return isSelected ? 1 : dim;
	},

	/** 選択状態からZアニメーションターゲットを決定 */
	calcTargetZ(params: { isSelected: boolean; facingFactor: number }) {
		const { isSelected, facingFactor } = params;
		const zBase = isSelected ? this.ANIMATION.Z_SELECTED : this.ANIMATION.Z_DEFAULT;
		return facingFactor * zBase;
	},

	/** gesture planeのサイズ（pageWidthから派生） */
	calcGesturePlaneArgs(pageWidth: number): [number, number] {
		return [pageWidth + this.GESTURE.PLANE_PADDING_X, this.GESTURE.PLANE_HEIGHT] as const;
	},

	/** page の offset X（pageIndexから） */
	calcPageOffsetX(params: {
		pageIndex: number;
		pageWidth: number;
		facingFactor: number;
	}) {
		const { pageIndex, pageWidth, facingFactor } = params;
		return pageIndex * (pageWidth + this.PAGE_GAP_X) * facingFactor;
	},
} as const;

// 色定義はSharedから利用
export const CardColors = DESIGN.COLORS;
