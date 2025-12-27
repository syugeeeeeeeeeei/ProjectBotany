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
 * 3D空間上で特定の領域を強調するための汎用枠線コンポーネント。
 * shared層に配置し、各機能（feature）からプロパティを指定して利用する。
 */
export const Outline: React.FC<OutlineProps> = ({
  color,
  size = 0.45,
  thickness = 0.05,
  yOffset = 0.1,
  rotationX = -Math.PI / 2,
  rotationZ = Math.PI / 4,
}) => (
  <mesh position={[0, yOffset, 0]} rotation={[rotationX, 0, rotationZ]}>
    {/* 外径と内径を指定してリングを作成 */}
    <ringGeometry args={[size - thickness, size, 4, 1]} />
    <meshBasicMaterial color={color} side={THREE.DoubleSide} />
  </mesh>
);