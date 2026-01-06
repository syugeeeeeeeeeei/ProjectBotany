import React from "react";
import { AlienInstance } from "@/shared/types/game-schema";
import { DESIGN } from "@/shared/constants/design-tokens";

interface AlienTokenProps {
  x: number;
  y: number;
  status: AlienInstance["status"];
  isPreview?: boolean;
  isReady?: boolean; // ✨ 配置可能状態 (1秒経過済み)
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

  // プレビュー時の見た目調整
  // 準備完了なら濃く、未完了なら薄く表示
  const opacity = isPreview ? (isReady ? 0.9 : 0.3) : 1.0;
  const transparent = isPreview;

  // 準備完了時はエミッシブを強くして「置いてOK」感を出す
  const emissiveIntensity = isPreview ? (isReady ? 2.0 : 0.5) : 1.0;

  // 準備完了時は色味を変えても良い (例: 明るい緑)
  const seedColor = isPreview && isReady ? "#CCFF90" : "#8BC34A";

  // 種 (Seed) の場合
  if (status === "seed") {
    return (
      <group position={[posX, 0.2, posZ]}>
        <mesh raycast={() => null}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color={seedColor}
            emissive="#33691E"
            emissiveIntensity={emissiveIntensity}
            opacity={opacity}
            transparent={transparent}
          />
        </mesh>
      </group>
    );
  }

  // 成体 (Plant) の場合
  return (
    <group position={[posX, 0.5, posZ]}>
      <mesh raycast={() => null}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color="purple"
          emissive="#440044"
          opacity={opacity}
          transparent={transparent}
        />
      </mesh>
    </group>
  );
};
