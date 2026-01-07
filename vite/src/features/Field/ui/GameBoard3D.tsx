// vite/src/features/field-grid/ui/GameBoard3D.tsx
import React, { useRef } from "react";
import { Group } from "three";
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

  // 背景クリックハンドラ
  // 盤面の裏や隙間をクリックしたときに選択を解除する
  const handleBackgroundClick = (e: MouseEvent) => {
    e.stopPropagation();
    // カードクリック等のstopPropagationが効いていればここは呼ばれない
    deselectCard();
  };

  return (
    <group ref={boardRef}>
      {/* ✨ 修正: 背景プレーンも onPointerUp ではなく onClick を使用する。
           これにより、Hand3D(onClick) で stopPropagation されたイベントが
           ここで拾われるのを確実に防ぐことができる。
       */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleBackgroundClick}
        visible={false} // 不可視
      >
        <planeGeometry args={[1000, 1000]} /> {/* 確実に画面全体を覆うサイズ */}
      </mesh>

      {/* 🟫 盤面の茶色ベース */}
      {cols > 0 && rows > 0 && (
        <BoardBase width={boardWidth} height={boardHeight} thickness={0.001} />
      )}

      <group name="grid-layer">
        {field.cells.flat().map((cell) => (
          <Cell key={`cell-${cell.x}-${cell.y}`} cell={cell} />
        ))}
      </group>

      <group name="token-layer">
        {Object.values(activeAliens).map((alien) => (
          <AlienToken
            key={`alien-${alien.instanceId}`}
            x={alien.currentX}
            y={alien.currentY}
            status={alien.status}
          />
        ))}
      </group>

      {/* ガイドレイヤー */}
      <PlacementGuide />
    </group>
  );
};

export default GameBoard3D;
