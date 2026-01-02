// src/features/card-hand/ui/parts/cardGeometries.ts
import * as THREE from "three";
import { CardLayout } from "../../domain/CardLayout"; // パスはそのまま、中身が変わっている

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

  // CardLayoutの改修で、これらは絶対座標計算用のヘルパーとして定義されている
  // 形状生成ロジックは相対座標（width/height）で計算するため、ここで取得するのは「形状のY座標」
  const baselineY = header.TOP_LINE;
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
  debugNoCurves?: boolean;
}>;

export const createHeaderShape = (
  options: CreateHeaderShapeOptions = {},
): THREE.Shape => {
  const { debugNoCurves = false } = options;

  const shape = new THREE.Shape();
  const points = deriveHeaderWavePoints();

  shape.moveTo(points.leftBottom.x, points.leftBottom.y);

  if (debugNoCurves) {
    shape.lineTo(points.leftTop.x, points.leftTop.y);
    shape.lineTo(points.rightTop.x, points.rightTop.y);
    shape.lineTo(points.rightBottom.x, points.rightBottom.y);
    shape.closePath();
    return shape;
  }

  const { leftCurve, rightCurve } = buildHeaderWaveCurves(points);

  shape.lineTo(points.leftSideDip.x, points.leftSideDip.y);
  bezierTo(shape, leftCurve);
  bezierTo(shape, rightCurve);
  shape.lineTo(points.rightBottom.x, points.rightBottom.y);
  shape.closePath();

  return shape;
};

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

  shape.lineTo(leftX, topY - radius);
  shape.quadraticCurveTo(leftX, topY, leftX + radius, topY);

  shape.lineTo(rightX - radius, topY);
  shape.quadraticCurveTo(rightX, topY, rightX, topY - radius);

  shape.lineTo(rightX, bottomY + radius);
  shape.quadraticCurveTo(rightX, bottomY, rightX - radius, bottomY);

  shape.lineTo(leftX + radius, bottomY);
  shape.quadraticCurveTo(leftX, bottomY, leftX, bottomY + radius);

  return shape;
};