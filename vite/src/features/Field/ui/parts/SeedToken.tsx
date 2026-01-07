import React, { useMemo } from "react";
import * as THREE from "three";
import { Float, useTexture } from "@react-three/drei";
import { DESIGN } from "@/shared/constants/design-tokens";

interface SeedTokenProps {
  x: number;
  y: number;
  imageUrl?: string; // 写真のURL
  isPreview?: boolean;
  isReady?: boolean;
}

export const SeedToken: React.FC<SeedTokenProps> = ({
  x,
  y,
  imageUrl = "https://placehold.co/256x160/ccc/999?text=Loading", // デフォルト画像
  isPreview = false,
  isReady = false,
}) => {
  const posX = (x - (7 - 1) / 2) * DESIGN.BOARD.CELL_GAP;
  const posZ = (y - (10 - 1) / 2) * DESIGN.BOARD.CELL_GAP;

  const opacity = isPreview ? (isReady ? 0.9 : 0.3) : 1.0;

  return (
    <group position={[posX, 0.4, posZ]}>
      {/* ふわふわ浮かせる */}
      <Float speed={8} rotationIntensity={0.3} floatIntensity={1}>
        <Seed3D
          imageUrl={imageUrl}
          scale={0.3} // AlienToken(0.3)より少し小さめ
          opacity={opacity}
        />
      </Float>

      {/* 影 (簡易的な黒い円) */}
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.12, 32]} />
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
    // 中心を基準にトリミングされるように設定
    texture.center.set(0.5, 0.5);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
  }, [texture]);

  // マテリアル定義 (AlienTokenと共通の質感)
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

  // ジオメトリ定義
  const geoms = useMemo(() => {
    // 1. 本体（球体）
    const body = new THREE.SphereGeometry(1.0, 32, 32);

    // 2. 窓枠（トーラス/リング）
    // radius: 0.6 (窓の大きさ), tube: 0.1 (枠の太さ)
    const frame = new THREE.TorusGeometry(0.7, 0.08, 16, 48);

    // 3. 写真部分（円）
    const photo = new THREE.CircleGeometry(0.7, 32);

    return { body, frame, photo };
  }, []);

  return (
    <group scale={scale}>
      {/* 本体: ブロンズ色の球体 */}
      <mesh geometry={geoms.body} material={mats.liteGreen} />

      {/* 正面の窓グループ */}
      {/* 球体の正面(Z軸手前)に配置 */}
      <group position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* 金色のフレーム */}
        <mesh geometry={geoms.frame} material={mats.gold} />

        {/* 内部の暗い背景（写真の裏打ち） */}
        <mesh
          position={[0, 0, -0.02]}
          geometry={geoms.photo}
          material={mats.dark}
        />

        {/* 写真 */}
        <mesh position={[0, 0, 0.05]} geometry={geoms.photo}>
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
