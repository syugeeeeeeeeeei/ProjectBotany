/*
  AlienToken.tsx
  - ユーザー提示のインターフェースに合わせた実装。
  - status === 'seed' は既存の球体。
  - status !== 'seed' は装飾トークン（フレーム＋花＋コイン）を表示。

  依存:
    npm i three @react-three/fiber @react-three/drei

  注意:
  - DESIGN / AlienInstance はユーザー側の定義を使用。
  - flowerUrl はプロジェクトのパスに合わせて調整。
*/

import React, { useMemo } from "react";
import * as THREE from "three";
import { Line, useTexture } from "@react-three/drei";

import { AlienInstance } from "@/shared/types/game-schema";
import { DESIGN } from "@/shared/constants/design-tokens";

type Vec3 = readonly [number, number, number];

type AlienTokenProps = {
  x: number;
  y: number;
  status: AlienInstance["status"];
};

export const AlienToken: React.FC<AlienTokenProps> = ({ x, y, status }) => {
  const posX = (x - (7 - 1) / 2) * DESIGN.BOARD.CELL_GAP;
  const posZ = (y - (10 - 1) / 2) * DESIGN.BOARD.CELL_GAP;

  // 種 (Seed)
  if (status === "seed") {
    return (
      <group position={[posX, 0.2, posZ]}>
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#8BC34A" emissive="#33691E" />
        </mesh>
      </group>
    );
  }

  // 成体 (Plant) / その他: 装飾トークン
  // - 必要なら status に応じて operator/value/flowerUrl を切り替えてください
  const operator = "+";
  const value = 1;
  const flowerUrl = "/plants/ミズバショウ.png";

  return (
    <group position={[posX, 0, posZ]}>
      <Token3D
        operator={operator}
        value={value}
        flowerUrl={flowerUrl}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={0.3}
      />
    </group>
  );
};

type Token3DProps = {
  operator?: string;
  value?: number;
  flowerUrl?: string;
  position?: Vec3;
  rotation?: Vec3;
  scale?: number;
};

function Token3D({
  operator = "+",
  value = 1,
  flowerUrl = "/plants/ミズバショウ.png",
  position = [0, 0, 0],
  rotation = [-0.15, 0.25, 0],
  scale = 1,
}: Token3DProps) {
  const flowerTex = useTexture(flowerUrl);

  useMemo(() => {
    flowerTex.colorSpace = THREE.SRGBColorSpace;
    flowerTex.anisotropy = 4;
    flowerTex.needsUpdate = true;
  }, [flowerTex]);

  const mats = useMemo(() => {
    const gold = new THREE.MeshStandardMaterial({
      color: 0xc9a24d,
      metalness: 0.9,
      roughness: 0.25,
    });
    const bronze = new THREE.MeshStandardMaterial({
      color: 0x6b4e2e,
      metalness: 0.65,
      roughness: 0.4,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x2b2116,
      metalness: 0.25,
      roughness: 0.65,
    });
    const coin = new THREE.MeshStandardMaterial({
      color: 0x7b532b,
      metalness: 0.7,
      roughness: 0.35,
    });
    return { gold, bronze, dark, coin };
  }, []);

  const geoms = useMemo(() => {
    const frameShape = new THREE.Shape();
    frameShape.moveTo(-1.25, -1.35);
    frameShape.quadraticCurveTo(0, -2.05, 1.25, -1.35);
    frameShape.lineTo(1.45, 1.25);
    frameShape.quadraticCurveTo(0, 2.15, -1.45, 1.25);
    frameShape.closePath();

    const hole = new THREE.Path();
    hole.moveTo(-0.85, -0.95);
    hole.quadraticCurveTo(0, -1.45, 0.85, -0.95);
    hole.lineTo(1.0, 0.95);
    hole.quadraticCurveTo(0, 1.55, -1.0, 0.95);
    hole.closePath();
    frameShape.holes.push(hole);

    const frame = new THREE.ExtrudeGeometry(frameShape, {
      depth: 0.25,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.09,
      bevelSegments: 6,
      curveSegments: 24,
    });

    const back = new THREE.CylinderGeometry(1.02, 1.02, 0.12, 48);
    const inset = new THREE.CylinderGeometry(0.92, 0.92, 0.04, 48);

    const coin = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 48);
    const coinFace = new THREE.CircleGeometry(0.345, 48);
    const coinRim = new THREE.TorusGeometry(0.28, 0.025, 12, 48);
    const coinBaseRing = new THREE.TorusGeometry(0.39, 0.06, 16, 48);

    const flowerPlane = new THREE.PlaneGeometry(1.15, 1.55);

    return {
      frame,
      back,
      inset,
      coin,
      coinFace,
      coinRim,
      coinBaseRing,
      flowerPlane,
    };
  }, []);

  const leftLabelTex = useMemo(() => makeLabelTexture(operator), [operator]);
  const rightLabelTex = useMemo(() => makeLabelTexture(String(value)), [value]);

  const coinFaceMatL = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: leftLabelTex,
        metalness: 0.2,
        roughness: 0.7,
      }),
    [leftLabelTex],
  );

  const coinFaceMatR = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: rightLabelTex,
        metalness: 0.2,
        roughness: 0.7,
      }),
    [rightLabelTex],
  );

  const flowerMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: flowerTex,
        transparent: true,
        roughness: 0.9,
        metalness: 0.0,
      }),
    [flowerTex],
  );

  const archPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 32; i++) {
      const t = (i / 32) * Math.PI;
      pts.push(new THREE.Vector3(Math.cos(t) * 0.55, Math.sin(t) * 0.55, 0));
    }
    return pts;
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geoms.frame} material={mats.gold} />

      <mesh
        geometry={geoms.back}
        material={mats.bronze}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -0.05]}
      />

      <mesh
        geometry={geoms.inset}
        material={mats.dark}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 0.02]}
      />

      <mesh
        geometry={geoms.flowerPlane}
        material={flowerMat}
        position={[0, 0.15, 0.14]}
      />

      <mesh
        geometry={geoms.coinBaseRing}
        material={mats.gold}
        rotation={[Math.PI / 2, 0, 0]}
        position={[-0.82, -1.18, 0.12]}
      />
      <mesh
        geometry={geoms.coinBaseRing}
        material={mats.gold}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0.82, -1.18, 0.12]}
      />

      <group position={[-0.82, -1.18, 0.22]}>
        <mesh
          geometry={geoms.coin}
          material={mats.coin}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <mesh
          geometry={geoms.coinFace}
          material={coinFaceMatL}
          position={[0, 0, 0.061]}
        />
        <mesh
          geometry={geoms.coinRim}
          material={mats.coin}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, 0.065]}
        />
      </group>

      <group position={[0.82, -1.18, 0.22]}>
        <mesh
          geometry={geoms.coin}
          material={mats.coin}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <mesh
          geometry={geoms.coinFace}
          material={coinFaceMatR}
          position={[0, 0, 0.061]}
        />
        <mesh
          geometry={geoms.coinRim}
          material={mats.coin}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, 0.065]}
        />
      </group>

      <Line points={archPoints} position={[0, 0.65, 0.14]} lineWidth={1} />
    </group>
  );
}

function makeLabelTexture(label: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("CanvasRenderingContext2D is not available.");
  }

  ctx.fillStyle = "#2b2116";
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = "#c9a24d";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(128, 128, 98, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#f5e6c8";
  ctx.font = "bold 160px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 128, 140);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}
