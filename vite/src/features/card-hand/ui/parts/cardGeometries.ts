import * as THREE from "three";
import { CardLayout } from "../../domain/cardLayout";

/**
 * カードヘッダーの「波状（ウェーブ）」形状を生成する
 */
export const createHeaderShape = (width: number, height: number): THREE.Shape => {
	const shape = new THREE.Shape();

	const contentWidth = width * CardLayout.RATIOS.CONTENT_WIDTH;

	// 旧: CardLayout.SIZE.HEIGHT * 0.15
	// 新: CardLayout.BASE.HEIGHT を参照（カード高さに対する割合）
	const headerThickness = CardLayout.BASE.HEIGHT * 0.15;

	// 旧: CardLayout.HEADER_CURVE.TOP_Y_OFFSET
	// 新: CardLayout.COMPONENTS.HEADER.TOP_Y_OFFSET
	const headerBaselineY = height / 2 - CardLayout.COMPONENTS.HEADER.TOP_Y_OFFSET;

	// 旧: CardLayout.HEADER_CURVE.*（FIX/PEAKなど）
	// 新: CardLayout.COMPONENTS.HEADER.*（SIDE_EDGE_FIX/PEAK_AMPLITUDEなど）
	const {
		BEZIER_CONTROL_X_RATIO,
		BEZIER_TANGENT_X_RATIO,
		SIDE_EDGE_FIX: sideEdgeYOffset,
		PEAK_AMPLITUDE: curveAmplitude,
	} = CardLayout.COMPONENTS.HEADER;

	const left = -contentWidth / 2;
	const right = contentWidth / 2;
	const bottomY = headerBaselineY - headerThickness;

	shape.moveTo(left, bottomY);
	shape.lineTo(left, headerBaselineY - sideEdgeYOffset);

	shape.bezierCurveTo(
		left,
		headerBaselineY,
		-contentWidth * BEZIER_CONTROL_X_RATIO,
		headerBaselineY + curveAmplitude,
		-contentWidth * BEZIER_TANGENT_X_RATIO,
		headerBaselineY,
	);

	shape.bezierCurveTo(
		0,
		headerBaselineY - curveAmplitude,
		contentWidth * BEZIER_TANGENT_X_RATIO,
		headerBaselineY,
		right,
		headerBaselineY - sideEdgeYOffset,
	);

	shape.lineTo(right, bottomY);
	shape.closePath();

	return shape;
};

/**
 * 角丸の長方形形状を生成する (Base用)
 * @param width 幅
 * @param height 高さ
 * @param radius 角丸の半径
 */
export const createRoundedRectShape = (
	width: number,
	height: number,
	radius: number,
): THREE.Shape => {
	const shape = new THREE.Shape();
	const x = -width / 2;
	const y = -height / 2;

	shape.moveTo(x, y + radius);
	shape.lineTo(x, y + height - radius);
	shape.quadraticCurveTo(x, y + height, x + radius, y + height);
	shape.lineTo(x + width - radius, y + height);
	shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
	shape.lineTo(x + width, y + radius);
	shape.quadraticCurveTo(x + width, y, x + width - radius, y);
	shape.lineTo(x + radius, y);
	shape.quadraticCurveTo(x, y, x, y + radius);

	return shape;
};
