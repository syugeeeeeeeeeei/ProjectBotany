// vite/src/features/field-grid/ui/parts/BoardBase.tsx
import React from "react";

type BoardBaseProps = {
  width: number; // 盤面の横サイズ
  height: number; // 盤面の縦サイズ
  thickness: number; // 厚み
};

export const BoardBase: React.FC<BoardBaseProps> = ({
  width,
  height,
  thickness,
}) => {
  return (
    <mesh
      position={[0, -thickness, 0]} // マス目の少し下
      receiveShadow
    >
      {/* 厚みのある箱 */}
      <boxGeometry args={[width, thickness, height]} />
      <meshStandardMaterial
        color="#8b5a2b" // 茶色（木）
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
};
