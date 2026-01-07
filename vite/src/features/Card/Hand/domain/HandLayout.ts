// src/features/card-hand/domain/HandLayout.ts
import { CardLayout } from "./CardLayout"

/**
 * Hand (cards list) Layout Tokens
 * Scale: 1.0 (Refactored to match real world units)
 */
export const HandLayout = {
	CARDS_PER_PAGE: 3,

	CARD_GAP_X: 0.2,

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
			// 見た目の反転は Hand3D 側の親 group で 180° 回転させるため、
			// ここでは facingFactor を受け取らない「純粋な向き」に固定する
			X: -(Math.PI / 2.2),
			Y: 0,
			Z: 0,
		},
	},

	GESTURE: {
		PLANE_PADDING_X: 1,
		PLANE_HEIGHT: 4.5,
		ROTATION: { X: -Math.PI / 2, Y: 0, Z: 0 },
		POSITION: { X: 0, Y: -0.3, Z: -0.225 },
		MATERIAL: { OPACITY: 0, DEPTH_WRITE: false },
	},

	ANIMATION: {
		Z_SELECTED: 2.5,
		Z_DEFAULT: 0,
		SPRING_CONFIG: { tension: 500, friction: 50 },
	},

	get PAGE_WIDTH() {
		return (
			this.CARDS_PER_PAGE * CardLayout.CARD_BASE.WIDTH +
			(this.CARDS_PER_PAGE - 1) * this.CARD_GAP_X
		);
	},

	// facingFactor を受け取らない「純粋な」ローカルX
	calcCardXLocal(index: number) {
		const pageWidth = this.PAGE_WIDTH;
		const cardWidth = CardLayout.CARD_BASE.WIDTH;
		const gap = this.CARD_GAP_X;
		const x = -pageWidth / 2 + index * (cardWidth + gap) + cardWidth / 2;
		return x;
	},

	/**
	 * カードをDim（暗転）させるかどうかを判定
	 * 以前の calcTargetOpacity の代わり
	 */
	calcDimState(params: {
		isVisible: boolean;
		isAnySelected: boolean;
		isSelected: boolean;
	}): boolean {
		const { isVisible, isAnySelected, isSelected } = params;

		// 手札が非表示(奥にある)なら暗くする
		if (!isVisible) return true;

		// 誰も選択していないなら明るいまま
		if (!isAnySelected) return false;

		// 誰かが選択している時、自分が選択されていれば明るく、そうでなければ暗く
		return !isSelected;
	},

	// facingFactor を受け取らない（親groupの180°回転で反転させる）
	calcTargetZ(params: {
		isSelected: boolean;
		isAnySelected: boolean;
		isVisible: boolean;
	}) {
		const { isSelected, isAnySelected, isVisible } = params;

		// 選択されている
		if (isSelected) {
			if (isVisible) {
				// Show状態
				return this.ANIMATION.Z_SELECTED;
			} else {
				// Hide状態
				const showBaseLine = (this.POSITION.Z.HIDDEN - this.POSITION.Z.VISIBLE);
				return this.ANIMATION.Z_SELECTED - showBaseLine;
			}
		}
		// 選択されていない
		if (!isVisible) return 0;

		if (isAnySelected) {
			return this.POSITION.Z.HIDDEN - this.POSITION.Z.VISIBLE;
		}

		return 0;
	},

	calcGesturePlaneArgs(pageWidth: number): [number, number] {
		return [
			pageWidth + this.GESTURE.PLANE_PADDING_X,
			this.GESTURE.PLANE_HEIGHT,
		] as const;
	},

	// facingFactor を受け取らない（親groupの180°回転で反転）
	calcPageOffsetX(params: { pageIndex: number; pageWidth: number }) {
		const { pageIndex, pageWidth } = params;
		return pageIndex * (pageWidth + this.PAGE_GAP_X);
	},
} as const;