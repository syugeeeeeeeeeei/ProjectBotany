// src/features/card-hand/domain/cardLayout.ts
import { DESIGN } from "@/shared/constants/design-tokens";

/**
 * Card 3D Layout Tokens
 */
export const CardLayout = {
	// --- 1) Base physical size ---
	CARD_BASE: {
		WIDTH: 1.8,
		HEIGHT: 2.8,
		THICKNESS: 0.1,
		CORNER_RADIUS: 0.05,
		BORDER_THICKNESS: 0.06,
		get Z_SURFACE() {
			return this.THICKNESS - 0.049;
		},
	},

	// --- 2) Z layering offsets ---
	Z: {
		BASE_BG: 0,
		HEADER_BG: 0.002,
		IMAGE_BG: 0.003,
		DESC_BG: 0.003,
		COST_BG: 0.004,
		TEXT: 0.01,
		OVERLAY: 0.05,
	},

	// --- 3) Ratios ---
	RATIOS: {
		DESC_WIDTH: 0.75,
	},

	// --- 4) Area specific layout ---
	AREAS: {
		BASE_INNER: {
			get WIDTH() { return CardLayout.CARD_BASE.WIDTH - CardLayout.CARD_BASE.BORDER_THICKNESS * 2; },
			get HEIGHT() { return CardLayout.CARD_BASE.HEIGHT - CardLayout.CARD_BASE.BORDER_THICKNESS * 2; },
			get CONTENT_WIDTH() { return this.WIDTH - 0.1; },
			get CONTENT_HEIGHT() { return this.HEIGHT - 0.1; },
			get CORNER_RADIUS() {
				return Math.max(0, CardLayout.CARD_BASE.CORNER_RADIUS - CardLayout.CARD_BASE.BORDER_THICKNESS / 2);
			},
			get POSITION(): [x: number, y: number, z: number] {
				return [0, 0, CardLayout.CARD_BASE.Z_SURFACE + CardLayout.Z.BASE_BG];
			},
		},

		HEADER: {
			TOP_Y_OFFSET: 0.01,
			SIDE_EDGE_Y_OFFSET: 0.05,
			CURVE_AMPLITUDE: 0.06,
			BEZIER_CONTROL_X_RATIO: 1 / 3,
			BEZIER_TANGENT_X_RATIO: 1 / 6,
			get SIZE(): [width: number, height: number] {
				return [CardLayout.AREAS.BASE_INNER.CONTENT_WIDTH, CardLayout.AREAS.BASE_INNER.CONTENT_HEIGHT / 6];
			},
			get TOP_LINE(): number { return CardLayout.AREAS.BASE_INNER.CONTENT_HEIGHT / 2 - this.TOP_Y_OFFSET; },
			get CENTER_LINE(): number { return this.TOP_LINE - this.SIZE[1] / 2; },
			get BOTTOM_LINE(): number { return this.TOP_LINE - this.SIZE[1]; },
			get POSITION(): [x: number, y: number, z: number] {
				return [0, 0, CardLayout.CARD_BASE.Z_SURFACE + CardLayout.Z.HEADER_BG];
			},
		},

		COST: {
			RADIUS: 0.125,
			X_OFFSET: 0.19,
			Y_OFFSET: 0.19,
			get POSITION(): [x: number, y: number, z: number] {
				return [
					CardLayout.CARD_BASE.WIDTH / 2 - this.X_OFFSET,
					CardLayout.CARD_BASE.HEIGHT / 2 - this.Y_OFFSET,
					CardLayout.CARD_BASE.Z_SURFACE + CardLayout.Z.COST_BG
				];
			},
		},

		IMAGE: {
			TOP_Y_OFFSET: 0.01,
			IMAGE_PLANE_HEIGHT: 0.9,
			get SIZE(): [width: number, height: number] {
				return [CardLayout.AREAS.BASE_INNER.CONTENT_WIDTH, this.IMAGE_PLANE_HEIGHT];
			},
			get TOP_LINE(): number { return CardLayout.AREAS.HEADER.BOTTOM_LINE - this.TOP_Y_OFFSET; },
			get CENTER_LINE(): number { return this.TOP_LINE - this.SIZE[1] / 2; },
			get BOTTOM_LINE(): number { return this.TOP_LINE - this.SIZE[1]; },
			get POSITION(): [x: number, y: number, z: number] {
				return [0, this.CENTER_LINE, CardLayout.CARD_BASE.Z_SURFACE + CardLayout.Z.IMAGE_BG];
			},
		},

		DESC: {
			TOP_Y_OFFSET: 0.05,
			PLANE_HEIGHT: 1.15,
			get SIZE(): [width: number, height: number] {
				return [CardLayout.AREAS.BASE_INNER.CONTENT_WIDTH, this.PLANE_HEIGHT];
			},
			get TOP_LINE(): number { return CardLayout.AREAS.IMAGE.BOTTOM_LINE - this.TOP_Y_OFFSET; },
			get CENTER_LINE(): number { return this.TOP_LINE - this.SIZE[1] / 2; },
			get BOTTOM_LINE(): number { return this.TOP_LINE - this.SIZE[1]; },
			get POSITION(): [x: number, y: number, z: number] {
				return [0, this.CENTER_LINE, CardLayout.CARD_BASE.Z_SURFACE + CardLayout.Z.DESC_BG];
			},
		},

		COOLDOWN: {
			OPACITY: 0.6,
			COLOR: "gray",
			get POSITION(): [x: number, y: number, z: number] {
				return [0, 0, CardLayout.CARD_BASE.Z_SURFACE + CardLayout.Z.OVERLAY];
			},
			get SIZE(): [width: number, height: number] {
				return [CardLayout.CARD_BASE.WIDTH, CardLayout.CARD_BASE.HEIGHT];
			},
		},

		TEXT: {
			HEADER: {
				FONT: "MPLUS1p-Bold.ttf",
				FONT_SIZE: 0.14,
				ANCHOR_X: "center" as const,
				ANCHOR_Y: "middle" as const,
				get POSITION(): [x: number, y: number, z: number] {
					return [0, CardLayout.AREAS.HEADER.CENTER_LINE, CardLayout.Z.TEXT];
				},
			},
			COST: {
				FONT: "MPLUS1p-Bold.ttf",
				FONT_SIZE: 0.16,
				COLOR: "black",
				get POSITION(): [x: number, y: number, z: number] {
					return [0, 0, CardLayout.Z.TEXT];
				},
			},
			DESC: {
				FONT: "MPLUS1p-Regular.ttf",
				FONT_SIZE: 0.09,
				LINE_HEIGHT: 1.2,
				ANCHOR_X: "center" as const,
				ANCHOR_Y: "top" as const,
				OVERFLOW_WRAP: "break-word" as const,
				PADDING_TOP: 0.05,
				get POSITION(): [x: number, y: number, z: number] {
					return [0, CardLayout.AREAS.DESC.PLANE_HEIGHT / 2 - this.PADDING_TOP, CardLayout.Z.TEXT];
				},
				get MAX_WIDTH() {
					return CardLayout.AREAS.BASE_INNER.CONTENT_WIDTH - 0.12;
				},
			},
			COOLDOWN: {
				FONT: "MPLUS1p-Bold.ttf",
				FONT_SIZE: 0.5,
				COLOR: "white",
				ANCHOR_X: "center" as const,
				ANCHOR_Y: "middle" as const,
				get POSITION(): [x: number, y: number, z: number] {
					return [0, 0, CardLayout.Z.TEXT];
				},
			},
		},
	},

	COLORS: {
		BORDER: "#B8860B",
		...DESIGN.COLORS,
	},
} as const;

/**
 * Hand (cards list) Layout Tokens
 */
export const HandLayout = {
	CARDS_PER_PAGE: 3,
	CARD_GAP_X: 1.1,
	PAGE_GAP_X: 3,

	POSITION: {
		X: 0,
		Y: 2.2,
		Z: {
			VISIBLE: 3.5,
			HIDDEN: 6.0,
		},
	},

	CARD: {
		SCALE: 1.5,
		ROTATION: {
			X: (facingFactor: number) => (Math.PI / 2.2) * -facingFactor,
			Y: (facingFactor: number) => ((1 - facingFactor) / 2) * Math.PI,
			Z: 0,
		},
	},

	GESTURE: {
		PLANE_PADDING_X: 4,
		PLANE_HEIGHT: 4,
		ROTATION: { X: -Math.PI / 2, Y: 0, Z: 0 },
		POSITION: { X: 0, Y: -0.2, Z: -0.15 },
		MATERIAL: { OPACITY: 0, DEPTH_WRITE: false },
	},

	ANIMATION: {
		Z_SELECTED: -0.5,
		Z_OTHER_HIDDEN: 2.5,
		Z_DEFAULT: 0,
		SPRING_CONFIG: { tension: 300, friction: 20 },
		OPACITY_DIM: 0.5,
	},

	get PAGE_WIDTH() {
		return (
			this.CARDS_PER_PAGE * CardLayout.CARD_BASE.WIDTH +
			(this.CARDS_PER_PAGE - 1) * this.CARD_GAP_X
		);
	},

	calcCardXLocal(index: number, facingFactor: number) {
		const pageWidth = this.PAGE_WIDTH;
		const cardWidth = CardLayout.CARD_BASE.WIDTH;
		const gap = this.CARD_GAP_X;
		const x = -pageWidth / 2 + index * (cardWidth + gap) + cardWidth / 2;
		return x * facingFactor;
	},

	/** 修正：選択カードはHide状態でもOpacity 1にする */
	calcTargetOpacity(params: {
		isVisible: boolean;
		isAnySelected: boolean;
		isSelected: boolean;
	}) {
		const { isVisible, isAnySelected, isSelected } = params;
		const dim = this.ANIMATION.OPACITY_DIM;

		if (isSelected) return 1; // 選択されていれば常に表示
		if (!isVisible) return dim; // 手札が隠れていれば暗く
		if (!isAnySelected) return 1; // 誰も選択されていなければ通常表示
		return dim; // 他のカードが選択中なら暗く
	},

	/** 修正：Hide状態でも選択カードだけをShow状態にする計算を追加 */
	calcTargetZ(params: { isSelected: boolean; isAnySelected: boolean; isVisible: boolean; facingFactor: number }) {
		const { isSelected, isAnySelected, isVisible, facingFactor } = params;

		if (isSelected) {
			if (isVisible) {
				// 通常表示中：少し手前に浮かせる
				return facingFactor * this.ANIMATION.Z_SELECTED;
			} else {
				// 手札Hide中：全体がHIDDEN(6.0)にいるため、VISIBLE(3.5)付近まで浮かせるオフセット
				// 目標位置(3.0) = VISIBLE(3.5) + Z_SELECTED(-0.5)
				const popupOffset = (this.POSITION.Z.VISIBLE + this.ANIMATION.Z_SELECTED) - this.POSITION.Z.HIDDEN;
				return facingFactor * popupOffset;
			}
		}

		// 手札全体がHIDDENなら、他の非選択カードはオフセットなし（沈んだまま）
		if (!isVisible) return 0;

		// 通常表示中で他のカードが選択されている場合、ひっこめる
		if (isAnySelected) {
			return facingFactor * this.ANIMATION.Z_OTHER_HIDDEN;
		}

		return 0;
	},

	calcGesturePlaneArgs(pageWidth: number): [number, number] {
		return [
			pageWidth + this.GESTURE.PLANE_PADDING_X,
			this.GESTURE.PLANE_HEIGHT,
		] as const;
	},

	calcPageOffsetX(params: {
		pageIndex: number;
		pageWidth: number;
		facingFactor: number;
	}) {
		const { pageIndex, pageWidth, facingFactor } = params;
		return pageIndex * (pageWidth + this.PAGE_GAP_X) * facingFactor;
	},
} as const;

export const CardColors = DESIGN.COLORS;