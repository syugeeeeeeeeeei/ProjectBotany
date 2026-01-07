import React from "react";
import { AlienInstance } from "@/shared/types/game-schema";
import { DESIGN } from "@/shared/constants/design-tokens";
import {
  Float,
  MeshDistortMaterial,
  Icosahedron,
  Sparkles,
} from "@react-three/drei"; // ✨ 追加

interface AlienTokenProps {
  x: number;
  y: number;
  status: AlienInstance["status"];
  isPreview?: boolean;
  isReady?: boolean;
}

export const AlienToken: React.FC<AlienTokenProps> = ({
  x,
  y,
  status,
  isPreview = false,
  isReady = false,
}) => {
  const posX = (x - (7 - 1) / 2) * DESIGN.BOARD.CELL_GAP;
  const posZ = (y - (10 - 1) / 2) * DESIGN.BOARD.CELL_GAP;

  const opacity = isPreview ? (isReady ? 0.9 : 0.3) : 1.0;
  const transparent = isPreview;

  // 色設定
  const isSeed = status === "seed";
  const baseColor = isSeed
    ? isPreview && isReady
      ? "#CCFF90"
      : "#8BC34A"
    : "#9C27B0"; // 成体は紫系

  const emissiveColor = isSeed ? "#33691E" : "#4A0072";

  return (
    <group position={[posX, 0.3, posZ]}>
      {/* ✨ Float: 上下にふわふわ浮遊させる */}
      <Float
        speed={2} // アニメーション速度
        rotationIntensity={1} // 回転の強さ
        floatIntensity={1.5} // 上下動の強さ
      >
        {/* ✨ Icosahedron: 20面体 (クリスタルっぽい形状) */}
        <mesh castShadow receiveShadow>
          <icosahedronGeometry args={[isSeed ? 0.15 : 0.25, 0]} />

          {/* ✨ MeshDistortMaterial: 表面をぐにゃぐにゃ歪ませる (エイリアン感) */}
          <MeshDistortMaterial
            color={baseColor}
            emissive={emissiveColor}
            emissiveIntensity={isPreview && isReady ? 2.0 : 0.8}
            roughness={0.2}
            metalness={0.8}
            distort={0.4} // 歪みの強さ
            speed={2} // 歪みのアニメーション速度
            opacity={opacity}
            transparent={transparent}
          />
        </mesh>
      </Float>

      {/* ✨ Sparkles: 周囲にキラキラしたパーティクルを飛ばす (成体の場合) */}
      {!isSeed && (
        <Sparkles
          count={10}
          scale={0.8}
          size={2}
          speed={0.4}
          opacity={0.5}
          color="#E1BEE7"
        />
      )}

      {/* 影 (単純な丸い影を落とす) */}
      <mesh position={[0, -0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 32]} />
        <meshBasicMaterial color="black" transparent opacity={0.2} />
      </mesh>
    </group>
  );
};
