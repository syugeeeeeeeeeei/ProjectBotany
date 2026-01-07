import React, { useMemo } from "react";
import * as THREE from "three";
import { Float, useTexture } from "@react-three/drei";
import { DESIGN } from "@/shared/constants/design-tokens";

// ---------------------------------------------------------------------------
// ⚡️ 最適化: ジオメトリをコンポーネント外で定義 (Global)
// ---------------------------------------------------------------------------
// Seed本体 (球体)
const SHARED_SEED_BODY = new THREE.SphereGeometry(1.0, 32, 32);

// 窓枠 (トーラス)
const SHARED_SEED_FRAME = new THREE.TorusGeometry(0.7, 0.08, 16, 48);

// 写真部分 (円)
const SHARED_SEED_PHOTO = new THREE.CircleGeometry(0.7, 32);

// 影 (円)
const SHARED_SHADOW_GEO = new THREE.CircleGeometry(0.12, 32);
// ---------------------------------------------------------------------------

interface SeedTokenProps {
  x: number;
  y: number;
  imageUrl?: string;
  isPreview?: boolean;
  isReady?: boolean;
}

export const SeedToken: React.FC<SeedTokenProps> = ({
  x,
  y,
  imageUrl = "https://placehold.co/256x160/ccc/999?text=Loading",
  isPreview = false,
  isReady = false,
}) => {
  const posX = (x - (7 - 1) / 2) * DESIGN.BOARD.CELL_GAP;
  const posZ = (y - (10 - 1) / 2) * DESIGN.BOARD.CELL_GAP;

  const opacity = isPreview ? (isReady ? 0.9 : 0.3) : 1.0;

  return (
    <group position={[posX, 0.4, posZ]}>
      <Float speed={8} rotationIntensity={0.3} floatIntensity={1}>
        <Seed3D imageUrl={imageUrl} scale={0.3} opacity={opacity} />
      </Float>

      {/* 影 */}
      <mesh
        position={[0, -0.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={SHARED_SHADOW_GEO}
      >
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.2 * opacity}
        />
      </mesh>
    </group>
  );
};

// --- 3Dモデル部分 ---

type Seed3DProps = {
  imageUrl: string;
  scale?: number;
  opacity?: number;
};

function Seed3D({ imageUrl, scale = 1, opacity = 1 }: Seed3DProps) {
  const texture = useTexture(imageUrl);

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.center.set(0.5, 0.5);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
  }, [texture]);

  // マテリアルは opacity が変わるため useMemo のままでOK
  const mats = useMemo(() => {
    const common = {
      transparent: opacity < 1,
      opacity: opacity,
    };

    const gold = new THREE.MeshStandardMaterial({
      color: 0xc9a24d,
      metalness: 0.9,
      roughness: 0.25,
      ...common,
    });
    const bronze = new THREE.MeshStandardMaterial({
      color: 0x6b4e2e,
      metalness: 0.65,
      roughness: 0.4,
      ...common,
    });
    const liteGreen = new THREE.MeshStandardMaterial({
      color: 0x00ff7f,
      metalness: 0.65,
      roughness: 0.4,
      ...common,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x2b2116,
      metalness: 0.25,
      roughness: 0.65,
      ...common,
    });
    return { gold, bronze, dark, liteGreen };
  }, [opacity]);

  return (
    <group scale={scale}>
      {/* 本体 */}
      <mesh geometry={SHARED_SEED_BODY} material={mats.liteGreen} />

      {/* 正面の窓グループ */}
      <group position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* 金色のフレーム */}
        <mesh geometry={SHARED_SEED_FRAME} material={mats.gold} />

        {/* 内部の暗い背景 */}
        <mesh
          position={[0, 0, -0.02]}
          geometry={SHARED_SEED_PHOTO}
          material={mats.dark}
        />

        {/* 写真 */}
        <mesh position={[0, 0, 0.05]} geometry={SHARED_SEED_PHOTO}>
          <meshStandardMaterial
            map={texture}
            transparent={opacity < 1}
            opacity={opacity}
            roughness={0.5}
            emissive="white"
            emissiveIntensity={0.01}
          />
        </mesh>
      </group>
    </group>
  );
}
