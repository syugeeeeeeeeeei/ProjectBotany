import React, { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

interface GameLayoutProps {
  /** 3Dシーン内に配置する要素 (盤面、駒など) */
  children?: React.ReactNode;
  /** 2Dレイヤーに配置する要素 (HUD, ボタンなど) */
  uiOverlay?: React.ReactNode;
}

/**
 * 3Dシーンのカメラと操作（Controller）を管理するコンポーネント
 * GameLayoutからカメラ設定を分離し、OrbitControlsで自由な操作を提供します。
 */
const SceneController = () => {
  const { camera } = useThree();

  /**
   * コンポーネントのマウント時に一度だけカメラの初期位置と注視点を設定する。
   * ゲーム開始時に盤面全体が正しいアングルで見えるように強制するために必要です
   */
  useEffect(() => {
    camera.position.set(0, 10, 0);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <OrbitControls
      makeDefault
      enableZoom={false}
      enableRotate={false}
      enablePan={false}
    />
  );
};

/**
 * 3Dシーンの基本設定 (ライト、カメラ、操作)
 */
const SceneSetup: React.FC = () => {
  return (
    <>
      {/* カメラと操作系をここに配置 */}
      <SceneController />

      <color attach="background" args={["#1a1a1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      {/* 簡易的な床（デバッグ用） */}
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
          // 削除: camera={{ position: ... }} は SceneController に移動しました
          dpr={[1, 2]}
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
          pointerEvents: "none",
        }}
      >
        {uiOverlay}
      </div>
    </div>
  );
};
