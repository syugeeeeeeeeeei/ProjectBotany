import React from "react";
import * as THREE from "three";

interface OutlineProps {
  /** 枠線の色 */
  color: string;
  /** 外側のサイズ（半径的な値） */
  size?: number;
  /** 線の太さ */
  thickness?: number;
  /** Y軸のオフセット（マスより少し上に浮かせる） */
  yOffset?: number;
  /** 基本の回転角 */
  rotationX?: number;
  /** 追加のZ軸回転（菱形にする場合は Math.PI / 4） */
  rotationZ?: number;
}

/**
 * 3D 枠線コンポーネント (Outline)
 * 
 * 【動機】
 * ゲーム盤面の特定のマスを強調表示（ハイライト）するための視覚効果を提供するためです。
 * カードの効果範囲のプレビューや、選択中のマスの明示などに汎用的に使用されます。
 *
 * 【恩恵】
 * - `ringGeometry` を使用して、マスの形状（四角形を 45 度回転させた菱形）に
 *   フィットする細い枠線を効率的に描画します。
 * - `yOffset` により、地面（盤面）との干渉（Z-fighting）を避けつつ、
 *   きれいに重ねて表示することができます。
 *
 * 【使用法】
 * `InteractionRegistry` の `getCellOverlays` などで、色やサイズを指定して JSX として返します。
 */
export const Outline: React.FC<OutlineProps> = ({
  color,
  size = 0.45,
  thickness = 0.05,
  yOffset = 0.1,
  rotationX = -Math.PI / 2,
  rotationZ = Math.PI / 4,
}) => (
  /**
   * 枠線の 3D メッシュ描画
   * 盤面の 45 度回転したマス目に合わせ、菱形（ringGeometry の 4 端）として描画するために必要です
   */
  <mesh position={[0, yOffset, 0]} rotation={[rotationX, 0, rotationZ]}>
    {/* 外径と内径を指定してリングを作成 */}
    <ringGeometry args={[size - thickness, size, 4, 1]} />
    <meshBasicMaterial color={color} side={THREE.DoubleSide} />
  </mesh>
);