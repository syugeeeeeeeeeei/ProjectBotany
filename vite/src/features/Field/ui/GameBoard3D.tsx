// vite/src/features/field-grid/ui/GameBoard3D.tsx
import React, { useRef } from "react";
import { Group } from "three";
// import { ThreeEvent } from "@react-three/fiber";
import { useGameQuery } from "@/core/api/queries";
import { useUIStore } from "@/core/store/uiStore"; // 追加
import { Cell } from "./parts/Cell";
import { AlienToken } from "./parts/AlienToken";
// import { AlienToken } from "./parts/AlienToken2";
import { PlacementGuide } from "./PlacementGuide";

const GameBoard3D: React.FC = () => {
  const field = useGameQuery.useField();
  const activeAliens = useGameQuery.useActiveAliens();
  const boardRef = useRef<Group>(null);
  const deselectCard = useUIStore((s) => s.deselectCard); // 追加

  if (!field || !field.cells) return null;

  // 盤面外タップハンドラ
  const handlePointerMissed = () => {
    // 盤面操作中（カード選択中など）に盤面外をクリックしたら選択解除
    // ※ UIStoreの状態を見て判断してもよい
    deselectCard();
  };

  return (
    <group
      ref={boardRef}
      onPointerMissed={handlePointerMissed} // R3Fの機能: メッシュ以外をクリックしたとき発火
    >
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
