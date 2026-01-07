// src/core/ui/GameLayout.tsx
import React, { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import SceneBackground from "./SceneBackground";
// import { EnvironmentModel } from "@/features/Field/ui/parts/_EnvironmentModel";

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
    // カメラ設定: 真上(0, 10, 0)からの視点
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
const SceneSetup = () => {
  return (
    <>
      <SceneController />
      <color attach="background" args={["#1a1a1a"]} />

      {/* 💡 ライティング修正: 盤面全体を均一に照らす構成
        1. ambientLight: 全体の明るさを底上げし、端が暗くなるのを防ぐ。
        2. hemisphereLight: 上からの光と、地面からの照り返しをブレンドして自然な明るさを作る。
        3. directionalLight: 影を作る主光源。位置を斜めにして立体感を出す。
      */}

      {/* ベースライト: 強めに設定して暗部をなくす */}
      <ambientLight intensity={0.8} />

      {/* 天球光: 空間全体を柔らかな光で包む */}
      <hemisphereLight
        color="#ffffff" // 空の色
        groundColor="#555555" // 地面の色
        intensity={1}
      />

      {/* 3. メイン光源 (Key Light): 影をつくる強い光 */}
      <directionalLight
        position={[15, 25, 15]} // 右手前上空から
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        // ✨ 重要: 影の計算範囲を広げる (デフォルトは狭い)
        // これにより盤面の端までしっかり影が落ち、立体感が出ます
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* 4. サブ光源 (Fill Light): メインの逆側から当てる補助光 */}
      {/* 影は落とさず(castShadowなし)、メイン光の影になる側面をふんわり照らす */}
      <directionalLight
        position={[-15, 10, -15]} // 左奥から
        intensity={0.6}
      />

      {/* 環境反射: マットな質感用 */}
      <Environment preset="park" blur={3} background={false} />

      {/* 背景モデル/画像 */}
      {/* <EnvironmentModel /> */}
      <SceneBackground image="/textures/テーブル3.jpg" />

      {/* デバッグ用グリッド */}
      {/* <gridHelper args={[20, 20, 0x444444, 0x222222]} position={[0, -0.1, 0]} /> */}
    </>
  );
};

/**
 * GameLayoutコンポーネント
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
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: false,
            stencil: false,
            depth: true,
            powerPreference: "high-performance",
            precision: "highp",
          }}
        >
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
