import React, { useRef } from "react";
import { Group } from "three";
import { ThreeEvent } from "@react-three/fiber";
import { useGameQuery } from "@/core/api/queries";
import { useUIStore } from "@/core/store/uiStore";
import { Cell } from "./parts/Cell";
import { AlienToken } from "./parts/AlienToken";
import { PlacementGuide } from "./PlacementGuide";
import { BoardBase } from "./parts/BoardBase";

const GameBoard3D: React.FC = () => {
  const field = useGameQuery.useField();
  const activeAliens = useGameQuery.useActiveAliens();
  const boardRef = useRef<Group>(null);
  const deselectCard = useUIStore((s) => s.deselectCard);

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
  );
};

export default GameBoard3D;
