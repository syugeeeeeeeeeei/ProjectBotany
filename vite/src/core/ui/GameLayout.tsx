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
 */
const SceneController = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 10, 0);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <OrbitControls
      makeDefault
      // enableZoom={false}
      // enableRotate={false}
      // enablePan={false}
    />
  );
};

/**
 * 3Dシーンの基本設定 (ライト、カメラ、操作)
 */
const SceneSetup = () => {
  return (
    <>
      <SceneController />
      <color attach="background" args={["#1a1a1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <gridHelper args={[20, 20, 0x444444, 0x222222]} position={[0, -0.1, 0]} />
    </>
  );
};

/**
 * GameLayoutコンポーネント
 * ※ 以前のコードから React.FC の型注釈を削除（または統一）し、
 * Fast Refreshがコンポーネントとして正しく認識できるようにします。
 */
export const GameLayout = ({ children, uiOverlay }: GameLayoutProps) => {
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
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          zIndex: 0,
        }}
      >
        <Canvas shadows dpr={[1, 2]}>
          <Suspense fallback={null}>
            <SceneSetup />
            {children}
          </Suspense>
        </Canvas>
      </div>

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
