import { ThreeElements } from "@react-three/fiber";
import React from "react";

// ✨ 修正: MeshProps (Three.jsのメッシュ用プロパティ) を結合
type BoardBaseProps = {
  width: number;
  height: number;
  thickness: number;
} & ThreeElements["mesh"];

export const BoardBase: React.FC<BoardBaseProps> = ({
  width,
  height,
  thickness,
  ...props // ✨ 追加: 残りのプロパティ(イベントハンドラ等)を受け取る
}) => {
  return (
    <mesh
      position={[0, -thickness, 0]}
      receiveShadow
      {...props} // ✨ 追加: 受け取ったプロパティをメッシュに適用
    >
      <boxGeometry args={[width, thickness, height]} />
      <meshStandardMaterial color="#8b5a2b" roughness={0.8} metalness={0.1} />
    </mesh>
  );
};
