// src/features/card-hand/domain/HandLayout.ts
import { CardLayout } from "./CardLayout"

/**
 * Hand (cards list) Layout Tokens
 * Scale: 1.0 (Refactored to match real world units)
 */
export const HandLayout = {
	CARDS_PER_PAGE: 3,

	CARD_GAP_X: 0.25,

	PAGE_GAP_X: 3,

	POSITION: {
		X: 0,
		Y: 1.5,
		Z: {
			VISIBLE: 4,
			HIDDEN: 7,
		},
	},

	CARD: {
		// SCALE: 1.5 は削除 (物理サイズ自体を大きくしたため)
		ROTATION: {
			X: (facingFactor: number) => (Math.PI / 2.2) * -facingFactor,
			Y: (facingFactor: number) => ((1 - facingFactor) / 2) * Math.PI,
			Z: 0,
		},
	},

	GESTURE: {
		PLANE_PADDING_X: 1, // 4 * 1.5
		PLANE_HEIGHT: 5,    // 4 * 1.5
		ROTATION: { X: -Math.PI / 2, Y: 0, Z: 0 },
		POSITION: { X: 0, Y: -0.3, Z: -0.225 }, // -0.2 * 1.5, -0.15 * 1.5
		MATERIAL: { OPACITY: 0, DEPTH_WRITE: false },
	},

	ANIMATION: {
		Z_SELECTED: 2.5,
		Z_DEFAULT: 0,
		SPRING_CONFIG: { tension: 300, friction: 25 },
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

	calcTargetOpacity(params: {
		isVisible: boolean;
		isAnySelected: boolean;
		isSelected: boolean;
	}) {
		const { isVisible, isAnySelected, isSelected } = params;
		const dim = this.ANIMATION.OPACITY_DIM;

		if (isSelected) return 1;
		if (!isVisible) return dim;
		if (!isAnySelected) return 1;
		return dim;
	},

	calcTargetZ(params: {
		isSelected: boolean;
		isAnySelected: boolean;
		isVisible: boolean;
		facingFactor: number;
	}) {
		const { isSelected, isAnySelected, isVisible, facingFactor } = params;

		if (isSelected) {
			if (isVisible) {
				return facingFactor * this.ANIMATION.Z_SELECTED;
			} else {
				const showBaseLine = (this.POSITION.Z.HIDDEN - this.POSITION.Z.VISIBLE);
				return facingFactor * this.ANIMATION.Z_SELECTED - showBaseLine;
			}
		}

		if (!isVisible) return 0;

		if (isAnySelected) {
			return facingFactor * (this.POSITION.Z.HIDDEN - this.POSITION.Z.VISIBLE);
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