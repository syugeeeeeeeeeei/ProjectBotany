// src/features/card-hand/domain/CardLayout.ts
import { DESIGN } from "@/shared/constants/design-tokens";

/**
 * Card 3D Layout Tokens (Refactored)
 * Scale: 1.0 (Previously 1.5x)
 * すべての値を実寸サイズに更新し、座標系をフラット化するための定義
 */
export const CardLayout = {
	// --- 1) Base physical size (x1.5 of original) ---
	CARD_BASE: {
		WIDTH: 3, // 1.8 * 1.5
		HEIGHT: 4.4, // 2.8 * 1.5
		THICKNESS: 0.15, // 0.1 * 1.5
		CORNER_RADIUS: 0.075, // 0.05 * 1.5
		BORDER_THICKNESS: 0.09, // 0.06 * 1.5
		get Z_SURFACE() {
			// 表面のZ座標 (中心から厚みの半分 + オフセット)
			return 0.0765;
		},
	},

	// --- 2) Z Layering (Absolute Z positions from center) ---
	// 各要素が重ならないようにするための絶対Z座標オフセット
	layers: {
		BASE: 0,
		BASE_INNER: 0.001,
		HEADER: 0.005,
		IMAGE: 0.007,
		DESC_BG: 0.007,
		COST_BG: 0.009,
		TEXT: 0.01, // テキストは背景から少し浮かせる
		OVERLAY: 0.02, // 最前面
		DIM_OVERLAY: 0.021, // Dim用オーバーレイはさらに上
	},

	// --- 3) Helper for Z positioning ---
	getZ(layerOffset: number) {
		return this.CARD_BASE.Z_SURFACE + layerOffset;
	},

	// --- 4) Area specific layout (Flat Coordinates) ---
	AREAS: {
		BASE_INNER: {
			get WIDTH() {
				return (
					CardLayout.CARD_BASE.WIDTH - CardLayout.CARD_BASE.BORDER_THICKNESS * 2
				);
			},
			get HEIGHT() {
				return (
					CardLayout.CARD_BASE.HEIGHT -
					CardLayout.CARD_BASE.BORDER_THICKNESS * 2
				);
			},
			get CONTENT_WIDTH() {
				return this.WIDTH - 0.15;
			}, // Margin x1.5
			get CONTENT_HEIGHT() {
				return this.HEIGHT - 0.15;
			},
			get CORNER_RADIUS() {
				return Math.max(
					0,
					CardLayout.CARD_BASE.CORNER_RADIUS -
					CardLayout.CARD_BASE.BORDER_THICKNESS / 2,
				);
			},
			get POSITION(): [number, number, number] {
				return [0, 0, CardLayout.getZ(CardLayout.layers.BASE_INNER)];
			},
		},

		HEADER: {
			TOP_Y_OFFSET: 0.015, // 0.01 * 1.5
			SIDE_EDGE_Y_OFFSET: 0.075, // 0.05 * 1.5
			CURVE_AMPLITUDE: 0.09, // 0.06 * 1.5
			BEZIER_CONTROL_X_RATIO: 1 / 3,
			BEZIER_TANGENT_X_RATIO: 1 / 6,
			get SIZE(): [number, number] {
				return [
					CardLayout.AREAS.BASE_INNER.CONTENT_WIDTH,
					CardLayout.AREAS.BASE_INNER.CONTENT_HEIGHT / 6,
				];
			},
			// Y座標計算用ヘルパー
			get TOP_LINE(): number {
				return (
					CardLayout.AREAS.BASE_INNER.CONTENT_HEIGHT / 2 - this.TOP_Y_OFFSET
				);
			},
			get CENTER_LINE(): number {
				return this.TOP_LINE - this.SIZE[1] / 2;
			},
			get BOTTOM_LINE(): number {
				return this.TOP_LINE - this.SIZE[1];
			},
			get POSITION(): [number, number, number] {
				return [0, 0, CardLayout.getZ(CardLayout.layers.HEADER)];
			},
		},

		COST: {
			RADIUS: 0.1875, // 0.125 * 1.5
			X_OFFSET: 0.285, // 0.19 * 1.5
			Y_OFFSET: 0.285,
			get POSITION(): [number, number, number] {
				return [
					CardLayout.CARD_BASE.WIDTH / 2 - this.X_OFFSET,
					CardLayout.CARD_BASE.HEIGHT / 2 - this.Y_OFFSET,
					CardLayout.getZ(CardLayout.layers.COST_BG),
				];
			},
		},

		// 使用制限表示エリア (右下あたり)
		USAGE_LIMIT: {
			RADIUS: 0.15,
			X_OFFSET: 0.285,
			Y_OFFSET: 0.285,
			get POSITION(): [number, number, number] {
				return [
					CardLayout.CARD_BASE.WIDTH / 2 - this.X_OFFSET,
					-(CardLayout.CARD_BASE.HEIGHT / 2 - this.Y_OFFSET), // Costと対角(右下)
					CardLayout.getZ(CardLayout.layers.COST_BG),
				];
			},
		},

		IMAGE: {
			TOP_Y_OFFSET: 0.015,
			IMAGE_PLANE_HEIGHT: 1.35, // 0.9 * 1.5
			get SIZE(): [number, number] {
				return [
					CardLayout.AREAS.BASE_INNER.CONTENT_WIDTH,
					this.IMAGE_PLANE_HEIGHT,
				];
			},
			get TOP_LINE(): number {
				return (
					CardLayout.AREAS.HEADER.BOTTOM_LINE - this.TOP_Y_OFFSET
				);
			},
			get CENTER_LINE(): number {
				return this.TOP_LINE - this.SIZE[1] / 2;
			},
			get BOTTOM_LINE(): number {
				return this.TOP_LINE - this.SIZE[1];
			},
			get POSITION(): [number, number, number] {
				return [
					0,
					this.CENTER_LINE,
					CardLayout.getZ(CardLayout.layers.IMAGE),
				];
			},
		},

		DESC: {
			TOP_Y_OFFSET: 0.075, // 0.05 * 1.5
			PLANE_HEIGHT: 1.9, // 1.15 * 1.5
			get SIZE(): [number, number] {
				return [
					CardLayout.AREAS.BASE_INNER.CONTENT_WIDTH,
					this.PLANE_HEIGHT,
				];
			},
			get TOP_LINE(): number {
				return (
					CardLayout.AREAS.IMAGE.BOTTOM_LINE - this.TOP_Y_OFFSET
				);
			},
			get CENTER_LINE(): number {
				return this.TOP_LINE - this.SIZE[1] / 2;
			},
			get POSITION(): [number, number, number] {
				return [
					0,
					this.CENTER_LINE,
					CardLayout.getZ(CardLayout.layers.DESC_BG),
				];
			},
		},

		COOLDOWN: {
			OPACITY: 0.85, // 凍結感のために少し不透明度を上げる
			COLOR: "#aaddff", // 氷っぽい色
			TEXTURE_SCALE: 1,
			get POSITION(): [number, number, number] {
				// 少しZを上げて干渉を防ぐ
				return [0, 0, CardLayout.getZ(CardLayout.layers.OVERLAY + 0.02)];
			},
			get SIZE(): [number, number] {
				// カード全体を覆う
				return [CardLayout.CARD_BASE.WIDTH, CardLayout.CARD_BASE.HEIGHT];
			},
		},

		DIM_OVERLAY: {
			COLOR: "black",
			OPACITY: 0.3,
			get POSITION(): [number, number, number] {
				return [0, 0, CardLayout.getZ(CardLayout.layers.DIM_OVERLAY)];
			},
			get SIZE(): [number, number] {
				return [CardLayout.CARD_BASE.WIDTH, CardLayout.CARD_BASE.HEIGHT];
			},
		},

		TEXT: {
			HEADER: {
				FONT: "MPLUS1p-Bold.ttf",
				FONT_SIZE: 0.21,
				ANCHOR_X: "center" as const,
				ANCHOR_Y: "middle" as const,
				get POSITION(): [number, number, number] {
					// テキストは各エリアのZ + TEXTオフセット
					return [
						0,
						CardLayout.AREAS.HEADER.CENTER_LINE,
						CardLayout.getZ(CardLayout.layers.HEADER + 0.01),
					];
				},
			},
			COST: {
				FONT: "MPLUS1p-Bold.ttf",
				FONT_SIZE: 0.24, // 0.16 * 1.5
				COLOR: "black",
				get POSITION(): [number, number, number] {
					// Costエリアのpositionに依存
					const [x, y, z] = CardLayout.AREAS.COST.POSITION;
					return [x, y, z + 0.01]; // 少し浮かせる
				},
			},
			USAGE_LIMIT: {
				FONT: "MPLUS1p-Bold.ttf",
				FONT_SIZE: 0.18,
				COLOR: "white", // 背景色次第で変更
				get POSITION(): [number, number, number] {
					const [x, y, z] = CardLayout.AREAS.USAGE_LIMIT.POSITION;
					return [x, y, z + 0.01];
				},
			},
			DESC: {
				FONT: "MPLUS1p-Regular.ttf",
				FONT_SIZE: 0.135, // 0.09 * 1.5
				LINE_HEIGHT: 1.2,
				ANCHOR_X: "center" as const,
				ANCHOR_Y: "top" as const,
				OVERFLOW_WRAP: "break-word" as const,
				PADDING_TOP: 0.075, // 0.05 * 1.5
				get POSITION(): [number, number, number] {
					const [x, y, z] = CardLayout.AREAS.DESC.POSITION;
					const height = CardLayout.AREAS.DESC.PLANE_HEIGHT;
					// 上寄せ配置
					return [
						x,
						y + height / 2 - this.PADDING_TOP,
						z + 0.01,
					];
				},
				get MAX_WIDTH() {
					return CardLayout.AREAS.BASE_INNER.CONTENT_WIDTH - 0.18; // 0.12 * 1.5
				},
			},
			COOLDOWN: {
				FONT: "MPLUS1p-Bold.ttf",
				FONT_SIZE: 0.75, // 0.5 * 1.5
				COLOR: "#004488", // 氷の上の濃い青
				ANCHOR_X: "center" as const,
				ANCHOR_Y: "middle" as const,
				get POSITION(): [number, number, number] {
					// オーバーレイよりさらに手前
					return [0, 0, CardLayout.getZ(CardLayout.layers.OVERLAY + 0.03)];
				},
			},
		},
	},

	COLORS: {
		BORDER: "#B8860B",
		CARD_UI: DESIGN.COLORS.CARD_UI,
		CARD_TYPES: DESIGN.COLORS.CARD_TYPES,
		USAGE_LIMIT_BG: "#444", // 使用制限バッジの背景
	},
} as const;

export const CardColors = CardLayout.COLORS;