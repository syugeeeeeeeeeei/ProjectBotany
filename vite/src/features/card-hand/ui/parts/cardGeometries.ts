import * as THREE from "three";
import { CardLayout } from "../../domain/cardLayout";

type Vec2 = Readonly<{ x: number; y: number }>;

type CubicBezier = Readonly<{
  cp1: Vec2;
  cp2: Vec2;
  end: Vec2;
}>;

const bezierTo = (shape: THREE.Shape, curve: CubicBezier) => {
  shape.bezierCurveTo(
    curve.cp1.x,
    curve.cp1.y,
    curve.cp2.x,
    curve.cp2.y,
    curve.end.x,
    curve.end.y,
  );
};

type HeaderWavePoints = Readonly<{
  leftBottom: Vec2;
  rightBottom: Vec2;

  // “通常描画”用（sideDip含む）
  leftSideDip: Vec2;
  rightSideDip: Vec2;

  // “四角形デバッグ”用（上辺は基準線に揃える）
  leftTop: Vec2;
  rightTop: Vec2;

  // wave controls
  leftTangent: Vec2;
  centerValley: Vec2;
  rightTangent: Vec2;

  leftEntryTangent: Vec2;
  leftCrest: Vec2;
}>;

const deriveHeaderWavePoints = (): HeaderWavePoints => {
  const header = CardLayout.AREAS.HEADER;

  const [width] = header.SIZE;

  const baselineY = header.TOP_LINE; // ヘッダーエリアの上辺（波の基準線）
  const bottomY = header.BOTTOM_LINE;

  const halfW = width / 2;
  const leftX = -halfW;
  const rightX = halfW;

  const sideDipY = baselineY - header.SIDE_EDGE_Y_OFFSET;

  const crestY = baselineY + header.CURVE_AMPLITUDE;
  const valleyY = baselineY - header.CURVE_AMPLITUDE;

  const controlX = width * header.BEZIER_CONTROL_X_RATIO;
  const tangentX = width * header.BEZIER_TANGENT_X_RATIO;

  return {
    // rectangle basics
    leftBottom: { x: leftX, y: bottomY },
    rightBottom: { x: rightX, y: bottomY },
    leftTop: { x: leftX, y: baselineY },
    rightTop: { x: rightX, y: baselineY },

    // normal outline (with side dip)
    leftSideDip: { x: leftX, y: sideDipY },
    rightSideDip: { x: rightX, y: sideDipY },

    // wave controls
    leftEntryTangent: { x: leftX, y: baselineY },
    leftCrest: { x: -controlX, y: crestY },
    leftTangent: { x: -tangentX, y: baselineY },

    centerValley: { x: 0, y: valleyY },
    rightTangent: { x: tangentX, y: baselineY },
  };
};

const buildHeaderWaveCurves = (p: HeaderWavePoints) => {
  const leftCurve: CubicBezier = {
    cp1: p.leftEntryTangent,
    cp2: p.leftCrest,
    end: p.leftTangent,
  };

  const rightCurve: CubicBezier = {
    cp1: p.centerValley,
    cp2: p.rightTangent,
    end: p.rightSideDip,
  };

  return { leftCurve, rightCurve };
};

type CreateHeaderShapeOptions = Readonly<{
  /** true: カーブを一切使わず、四角形として描画（デバッグ用） */
  debugNoCurves?: boolean;
}>;

/**
 * カードヘッダー形状を生成する
 * - 通常: 波状（ベジェ2本）
 * - デバッグ: カーブ無しの四角形
 */
export const createHeaderShape = (
  options: CreateHeaderShapeOptions = {},
): THREE.Shape => {
  const { debugNoCurves = false } = options;

  const shape = new THREE.Shape();
  const points = deriveHeaderWavePoints();

  // ---- common start (bottom-left) ----
  shape.moveTo(points.leftBottom.x, points.leftBottom.y);

  if (debugNoCurves) {
    // ===== Debug: NO CURVES (pure rectangle) =====
    shape.lineTo(points.leftTop.x, points.leftTop.y); // left edge
    shape.lineTo(points.rightTop.x, points.rightTop.y); // top edge
    shape.lineTo(points.rightBottom.x, points.rightBottom.y); // right edge
    shape.closePath();
    return shape;
  }

  // ===== Normal: wave + side dip =====
  const { leftCurve, rightCurve } = buildHeaderWaveCurves(points);

  shape.lineTo(points.leftSideDip.x, points.leftSideDip.y);
  bezierTo(shape, leftCurve);
  bezierTo(shape, rightCurve);
  shape.lineTo(points.rightBottom.x, points.rightBottom.y);
  shape.closePath();

  return shape;
};

/**
 * 角丸の長方形形状を生成する (Base用)
 */
export const createRoundedRectShape = (): THREE.Shape => {
  const shape = new THREE.Shape();

  const baseInner = CardLayout.AREAS.BASE_INNER;
  const width = baseInner.WIDTH;
  const height = baseInner.HEIGHT;
  const radius = baseInner.CORNER_RADIUS;

  const leftX = -width / 2;
  const rightX = width / 2;
  const bottomY = -height / 2;
  const topY = height / 2;

  shape.moveTo(leftX, bottomY + radius);

  // left edge
  shape.lineTo(leftX, topY - radius);
  shape.quadraticCurveTo(leftX, topY, leftX + radius, topY);

  // top edge
  shape.lineTo(rightX - radius, topY);
  shape.quadraticCurveTo(rightX, topY, rightX, topY - radius);

  // right edge
  shape.lineTo(rightX, bottomY + radius);
  shape.quadraticCurveTo(rightX, bottomY, rightX - radius, bottomY);

  // bottom edge
  shape.lineTo(leftX + radius, bottomY);
  shape.quadraticCurveTo(leftX, bottomY, leftX, bottomY + radius);

  return shape;
};
