import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

interface GameLayoutProps {
  /** 3Dシーン内に配置する要素 (盤面、駒など) */
  children?: React.ReactNode;
  /** 2Dレイヤーに配置する要素 (HUD, ボタンなど) */
  uiOverlay?: React.ReactNode;
}

/**
 * 3Dシーンの基本設定 (ライト、カメラ)
 */
const SceneSetup: React.FC = () => {
  return (
    <>
      <color attach="background" args={["#1a1a1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      {/* 簡易的な床（デバッグ用: Feature移植後は削除可） */}
      <gridHelper args={[20, 20, 0x444444, 0x222222]} position={[0, -0.1, 0]} />
    </>
  );
};

export const GameLayout: React.FC<GameLayoutProps> = ({
  children,
  uiOverlay,
}) => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      {/* Layer 1: 3D Scene */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          zIndex: 0,
        }}
      >
        <Canvas
          shadows
          camera={{
            position: [0, 8, 8],
            fov: 45,
            near: 0.1,
            far: 100,
          }}
          dpr={[1, 2]} // 解像度調整
        >
          <Suspense fallback={null}>
            <SceneSetup />
            {children}
          </Suspense>
        </Canvas>
      </div>

      {/* Layer 2: 2D UI Overlay */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          zIndex: 10,
          pointerEvents: "none", // UIがない部分は3D操作を通す
        }}
      >
        {/* pointer-events: auto を子要素で指定してクリック可能にする */}
        {uiOverlay}
      </div>

      {/* Debug Info */}
      <div
        style={{
          position: "absolute",
          bottom: 5,
          right: 5,
          color: "#666",
          fontSize: "10px",
          zIndex: 20,
        }}
      >
        Core-Feature v2 (Phase 3)
      </div>
    </div>
  );
};
