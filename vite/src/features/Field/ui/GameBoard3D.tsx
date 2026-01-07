// src/features/Field/ui/GameBoard3D.tsx
import React, { useRef } from "react";
import { Group } from "three";
import { ThreeEvent } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import { useGameQuery } from "@/core/api/queries";
import { useUIStore } from "@/core/store/uiStore";
import { Cell } from "./parts/Cell";
import { AlienToken } from "./parts/AlienToken";
import { PlacementGuide } from "./PlacementGuide";
import { BoardBase } from "./parts/BoardBase";
// ✨ 修正: パスが正しいか確認してください (ファイル名が RendorMonitor になっている場合はそちらに合わせてください)
import { RenderMonitor } from "@/features/Debug/Console/ui/RenderMonitor";
import { GeometryMonitor } from "@/features/Debug/Console/ui/GeometryMonitor";

const GameBoard3D: React.FC = () => {
  const field = useGameQuery.useField();
  const activeAliens = useGameQuery.useActiveAliens();
  const boardRef = useRef<Group>(null);
  const deselectCard = useUIStore((s) => s.deselectCard);

  // ✨ Debug設定を取得
  const showFps = useUIStore((s) => s.debugSettings.showFps);

  if (!field || !field.cells) return null;

  const rows = field.cells.length;
  const cols = field.cells[0]?.length ?? 0;

  const boardWidth = field.width * 1.05;
  const boardHeight = field.height * 1.05;

  const handleBackgroundClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    deselectCard();
  };

  return (
    <>
      {/* ✨ FPSモニター & レンダーモニター: 設定がONの時のみ表示 */}
      {/* Canvasの内部にあるため、ここでRenderMonitorを使うのはOKです */}
      {showFps && (
        <>
          <Stats />
          {/* Htmlコンポーネントでラップし、DOMレイヤーとして描画 */}
          <RenderMonitor />
          <GeometryMonitor />
        </>
      )}

      <group ref={boardRef}>
        {/* クリック判定用の透明な床 */}
        <mesh
          position={[0, -0.1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={handleBackgroundClick}
          visible={false}
        >
          <planeGeometry args={[100, 100]} />
        </mesh>

        {/* 盤面ベース */}
        {cols > 0 && rows > 0 && (
          <BoardBase width={boardWidth} height={boardHeight} thickness={0.1} />
        )}

        {/* グリッドレイヤー */}
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
              cardDefinitionId={alien.cardDefinitionId} // ✨ 追加: カードIDを渡す
            />
          ))}
        </group>

        {/* ガイドレイヤー */}
        <group position={[0, 0.07, 0]}>
          <PlacementGuide />
        </group>
      </group>
    </>
  );
};

export default GameBoard3D;
