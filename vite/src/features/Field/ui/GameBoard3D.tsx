// src/features/Field/ui/GameBoard3D.tsx
import React, { useRef, useEffect } from "react"; // ✨ useEffectを追加
import { Group } from "three";
import { ThreeEvent } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import { useGameQuery } from "@/core/api/queries";
import { useUIStore } from "@/core/store/uiStore";
import { Cell } from "./parts/Cell";
import { AlienToken } from "./parts/AlienToken";
import { PlacementGuide } from "./PlacementGuide";
import { BoardBase } from "./parts/BoardBase";
import { RenderMonitor } from "@/features/Debug/Console/ui/RenderMonitor";
import { GeometryMonitor } from "@/features/Debug/Console/ui/GeometryMonitor";

const GameBoard3D: React.FC = () => {
  const field = useGameQuery.useField();
  const activeAliens = useGameQuery.useActiveAliens();
  const boardRef = useRef<Group>(null);

  const deselectCard = useUIStore((s) => s.deselectCard);
  const hoverCell = useUIStore((s) => s.hoverCell);

  const showFps = useUIStore((s) => s.debugSettings.showFps);

  // ✨ 追加: 画面のどこで指を離してもガイドを解除する
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      // 指を離したら必ずホバー状態を解除
      hoverCell(null);
    };

    // windowに対してイベントを登録
    window.addEventListener("pointerup", handleGlobalPointerUp);
    // タッチデバイスの挙動を考慮し、cancel時も念の為監視
    window.addEventListener("pointercancel", handleGlobalPointerUp);

    return () => {
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
    };
  }, [hoverCell]);

  if (!field || !field.cells) return null;

  const rows = field.cells.length;
  const cols = field.cells[0]?.length ?? 0;

  const boardWidth = field.width * 1.05;
  const boardHeight = field.height * 1.05;

  // --- イベントハンドラ ---

  const handleBackgroundClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    deselectCard();
  };

  const handleBackgroundHover = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    hoverCell(null);
  };

  // 隙間(BoardBase)ホバー対策: 直前の状態を維持するためイベント伝播を止める
  const handleGapHover = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
  };

  return (
    <>
      {showFps && (
        <>
          <Stats />
          <RenderMonitor />
          <GeometryMonitor />
        </>
      )}

      <group ref={boardRef}>
        {/* 背景判定用メッシュ */}
        <mesh
          position={[0, -0.1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={handleBackgroundClick}
          onPointerOver={handleBackgroundHover}
          // onPointerUp は useEffect でカバーするため削除しました
          visible={false}
        >
          <planeGeometry args={[100, 100]} />
        </mesh>

        {/* 盤面ベース */}
        {cols > 0 && rows > 0 && (
          <BoardBase
            width={boardWidth}
            height={boardHeight}
            thickness={0.1}
            onPointerOver={handleGapHover} // ✨ 隙間対策は維持
            // onPointerUp は useEffect でカバーするため削除しました
          />
        )}

        <group name="grid-layer" position={[0, 0.01, 0]}>
          {field.cells.flat().map((cell) => (
            <Cell key={`cell-${cell.x}-${cell.y}`} cell={cell} />
          ))}
        </group>

        <group name="token-layer" position={[0, 0.05, 0]}>
          {Object.values(activeAliens).map((alien) => (
            <AlienToken
              key={`alien-${alien.instanceId}`}
              x={alien.currentX}
              y={alien.currentY}
              status={alien.status}
              cardDefinitionId={alien.cardDefinitionId}
            />
          ))}
        </group>

        <group position={[0, 0.07, 0]}>
          <PlacementGuide />
        </group>
      </group>
    </>
  );
};

export default GameBoard3D;
