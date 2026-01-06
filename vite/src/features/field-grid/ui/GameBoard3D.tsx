// vite/src/features/field-grid/ui/GameBoard3D.tsx
import React, { useRef } from "react";
import { Group } from "three";
import { ThreeEvent } from "@react-three/fiber";
import { useGameQuery } from "@/core/api/queries";
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { useUIStore } from "@/core/store/uiStore";
import { DESIGN } from "@/shared/constants/design-tokens";
import { CellState, AlienInstance } from "@/shared/types/game-schema";

const Cell: React.FC<{ cell: CellState }> = ({ cell }) => {
  const isSelected = useUIStore(
    (s) => s.selectedCell?.x === cell.x && s.selectedCell?.y === cell.y,
  );
  const isHovered = useUIStore(
    (s) => s.hoveredCell?.x === cell.x && s.hoveredCell?.y === cell.y,
  );

  const getCellColor = () => {
    switch (cell.type) {
      case "native":
        return DESIGN.COLORS.NATIVE_AREA;
      case "alien":
        return DESIGN.COLORS.ALIEN_INVASION;
      case "pioneer":
        return DESIGN.COLORS.RECOVERY_PENDING;
      case "bare":
        return DESIGN.COLORS.EMPTY;
      default:
        return DESIGN.COLORS.DEFAULT_CELL;
    }
  };

  const getEmissive = () => {
    if (isSelected) return "#ffffff";
    if (isHovered) return "#666666";
    return DESIGN.COLORS.EMISSIVE_DEFAULT;
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    gameEventBus.emit("CELL_CLICK", { cell });
  };

  const handlePointerOver = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    useUIStore.getState().hoverCell(cell);
  };

  const handlePointerOut = () => {
    useUIStore.getState().hoverCell(null);
  };

  const posX = (cell.x - (7 - 1) / 2) * DESIGN.BOARD.CELL_GAP;
  const posZ = (cell.y - (10 - 1) / 2) * DESIGN.BOARD.CELL_GAP;

  return (
    <mesh
      position={[posX, 0, posZ]}
      rotation={[DESIGN.BOARD.DEFAULT_ROTATION_X, 0, 0]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <planeGeometry args={[DESIGN.BOARD.CELL_SIZE, DESIGN.BOARD.CELL_SIZE]} />
      <meshStandardMaterial
        color={getCellColor()}
        emissive={getEmissive()}
        emissiveIntensity={isSelected || isHovered ? 0.5 : 0}
      />
    </mesh>
  );
};

// 修正: status プロパティを受け取るように変更
const AlienToken: React.FC<{
  x: number;
  y: number;
  status: AlienInstance["status"];
}> = ({ x, y, status }) => {
  const posX = (x - (7 - 1) / 2) * DESIGN.BOARD.CELL_GAP;
  const posZ = (y - (10 - 1) / 2) * DESIGN.BOARD.CELL_GAP;

  // 種 (Seed) の場合
  if (status === "seed") {
    return (
      <group position={[posX, 0.2, posZ]}>
        <mesh>
          {/* 小さめの球体 */}
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#8BC34A" emissive="#33691E" />
        </mesh>
      </group>
    );
  }

  // 成体 (Plant) の場合
  return (
    <group position={[posX, 0.5, posZ]}>
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="purple" emissive="#440044" />
      </mesh>
    </group>
  );
};

const GameBoard3D: React.FC = () => {
  const field = useGameQuery.useField();
  const activeAliens = useGameQuery.useActiveAliens();
  const boardRef = useRef<Group>(null);

  if (!field || !field.cells) return null;

  return (
    <group ref={boardRef}>
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
            status={alien.status} // statusを渡す
          />
        ))}
      </group>
    </group>
  );
};

export default GameBoard3D;
