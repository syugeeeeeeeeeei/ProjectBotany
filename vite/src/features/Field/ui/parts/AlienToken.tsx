import React, { useMemo } from "react";
import * as THREE from "three";
import {
  Float,
  MeshDistortMaterial,
  Sparkles,
  useTexture,
} from "@react-three/drei";
import { AlienInstance } from "@/shared/types/game-schema";
import { DESIGN } from "@/shared/constants/design-tokens";
import { cardMasterData } from "@/shared/data/cardMasterData";

interface AlienTokenProps {
  x: number;
  y: number;
  status: AlienInstance["status"];
  cardDefinitionId?: string; // カードIDを受け取る
  isPreview?: boolean;
  isReady?: boolean;
}

export const AlienToken: React.FC<AlienTokenProps> = ({
  x,
  y,
  status,
  cardDefinitionId,
  isPreview = false,
  isReady = false,
}) => {
  const posX = (x - (7 - 1) / 2) * DESIGN.BOARD.CELL_GAP;
  const posZ = (y - (10 - 1) / 2) * DESIGN.BOARD.CELL_GAP;

  const opacity = isPreview ? (isReady ? 0.9 : 0.3) : 1.0;
  const transparent = isPreview;

  // カード情報の取得
  const cardDef = useMemo(
    () => cardMasterData.find((c) => c.id === cardDefinitionId),
    [cardDefinitionId],
  );
  // 画像パスの特定 (見つからない場合はデフォルト画像など)
  const imageUrl = cardDef?.imagePath || "/plants/default.png";

  // --- 1. Seed (種) の描画 ---
  if (status === "seed") {
    const baseColor = isPreview && isReady ? "#CCFF90" : "#8BC34A";
    const emissiveColor = "#33691E";

    return (
      <group position={[posX, 0.3, posZ]}>
        <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
          <mesh castShadow receiveShadow>
            <icosahedronGeometry args={[0.15, 0]} />
            <MeshDistortMaterial
              color={baseColor}
              emissive={emissiveColor}
              emissiveIntensity={isPreview && isReady ? 2.0 : 0.8}
              roughness={0.2}
              metalness={0.8}
              distort={0.4}
              speed={2}
              opacity={opacity}
              transparent={transparent}
            />
          </mesh>
        </Float>
        <mesh position={[0, -0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial color="black" transparent opacity={0.2} />
        </mesh>
      </group>
    );
  }

  // --- 2. Plant (成体) の描画 ---
  return (
    // Y軸のポジションを 0.15 にして盤面から浮かせる
    <group position={[posX, 0.15, posZ]}>
      <Token3D
        imageUrl={imageUrl}
        scale={0.3}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        opacity={opacity}
      />
      {/* エフェクト */}
      <Sparkles
        count={5}
        scale={1.2}
        size={3}
        speed={0.4}
        opacity={0.3}
        color="#E1BEE7"
        position={[0, 0.5, 0]}
      />
    </group>
  );
};

// --- サブコンポーネント: リッチな3Dトークン ---

type Token3DProps = {
  imageUrl: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  opacity?: number;
};

function Token3D({
  imageUrl,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  opacity = 1,
}: Token3DProps) {
  const texture = useTexture(imageUrl);

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
  }, [texture]);

  // マテリアル定義
  const mats = useMemo(() => {
    const gold = new THREE.MeshStandardMaterial({
      color: 0xc9a24d,
      metalness: 0.9,
      roughness: 0.25,
      transparent: opacity < 1,
      opacity: opacity,
    });
    const bronze = new THREE.MeshStandardMaterial({
      color: 0x6b4e2e,
      metalness: 0.65,
      roughness: 0.4,
      transparent: opacity < 1,
      opacity: opacity,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x2b2116,
      metalness: 0.25,
      roughness: 0.65,
      transparent: opacity < 1,
      opacity: opacity,
    });
    return { gold, bronze, dark };
  }, [opacity]);

  // ジオメトリ定義
  const geoms = useMemo(() => {
    // 1. フレームの外形
    const frameShape = new THREE.Shape();
    frameShape.moveTo(-1.2, -1.3);
    frameShape.quadraticCurveTo(0, -1.9, 1.2, -1.3);
    frameShape.lineTo(1.4, 1.2);
    frameShape.quadraticCurveTo(0, 2.0, -1.4, 1.2);
    frameShape.closePath();

    // 2. フレームの内側の穴
    const holePath = new THREE.Path();
    holePath.moveTo(-1.05, -1.15);
    holePath.quadraticCurveTo(0, -1.65, 1.05, -1.15);
    holePath.lineTo(1.25, 1.05);
    holePath.quadraticCurveTo(0, 1.75, -1.25, 1.05);
    holePath.closePath();
    frameShape.holes.push(holePath);

    // 3. 写真表示用のシェイプ
    const photoShape = new THREE.Shape();
    photoShape.moveTo(-1.05, -1.15);
    photoShape.quadraticCurveTo(0, -1.65, 1.05, -1.15);
    photoShape.lineTo(1.25, 1.05);
    photoShape.quadraticCurveTo(0, 1.75, -1.25, 1.05);
    photoShape.closePath();

    // ジオメトリ生成
    const frame = new THREE.ExtrudeGeometry(frameShape, {
      depth: 0.2,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 6,
      curveSegments: 24,
    });

    const back = new THREE.CylinderGeometry(1.15, 1.15, 0.1, 48);
    const inset = new THREE.CylinderGeometry(1.1, 1.1, 0.02, 48);

    // 写真用のジオメトリ
    const photoGeom = new THREE.ShapeGeometry(photoShape, 24);

    // ✨ UVマッピングの調整
    photoGeom.computeBoundingBox();
    const box = photoGeom.boundingBox!;
    const rangeX = box.max.x - box.min.x;
    const rangeY = box.max.y - box.min.y;

    const uvAttribute = photoGeom.attributes.uv;
    const posAttribute = photoGeom.attributes.position;

    // 各頂点の位置に基づいてUV座標(0.0 ~ 1.0)を再計算
    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      const y = posAttribute.getY(i);

      // 左右反転 (1.0 - u)
      const u = 1.0 - (x - box.min.x) / rangeX;
      // ✨ 上下反転 (1.0 - v) を追加
      const v = 1.0 - (y - box.min.y) / rangeY;

      uvAttribute.setXY(i, u, v);
    }
    uvAttribute.needsUpdate = true;

    return { frame, back, inset, photoGeom };
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 金色のフレーム */}
      <mesh geometry={geoms.frame} material={mats.gold} />

      {/* 背面 */}
      <mesh
        geometry={geoms.back}
        material={mats.bronze}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -0.05]}
      />

      {/* 内部の暗い背景 */}
      <mesh
        geometry={geoms.inset}
        material={mats.dark}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 0.02]}
      />

      {/* 植物の画像 (カスタムジオメトリ) */}
      <mesh position={[0, 0, 0.21]} geometry={geoms.photoGeom}>
        {/* ✨ 修正: 上下反転対応とユーザー指定のマテリアル設定 */}
        <meshStandardMaterial
          map={texture}
          transparent
          alphaTest={0.5}
          roughness={0.5}
          emissive="white"
          emissiveIntensity={0.01} // 指定に合わせて修正
        />
      </mesh>
    </group>
  );
}
