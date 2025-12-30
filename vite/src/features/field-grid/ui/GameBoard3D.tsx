import React, { useRef } from "react";
import { Group } from "three";
// 修正: ThreeEvent 型をインポート
import { ThreeEvent } from "@react-three/fiber";
import { useGameQuery } from "@/core/api/queries";
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { useUIStore } from "@/core/store/uiStore";
import { DESIGN } from "@/shared/constants/design-tokens";
import { CellState } from "@/shared/types/game-schema";

/**
 * Cell Component
 * 個別のマスを描画する
 */
const Cell: React.FC<{ cell: CellState }> = ({ cell }) => {
  const isSelected = useUIStore(
    (s) => s.selectedCell?.x === cell.x && s.selectedCell?.y === cell.y,
  );
  const isHovered = useUIStore(
    (s) => s.hoveredCell?.x === cell.x && s.hoveredCell?.y === cell.y,
  );

  const getCellColor = () => {
    switch (cell.cellType) {
      case "native_area":
        return DESIGN.COLORS.NATIVE_AREA;
      case "alien_core":
        return DESIGN.COLORS.ALIEN_CORE;
      case "alien_invasion_area":
        return DESIGN.COLORS.ALIEN_INVASION;
      case "recovery_pending_area":
        return DESIGN.COLORS.RECOVERY_PENDING;
      case "empty_area":
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

  // 修正: any を ThreeEvent<MouseEvent> に変更
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    gameEventBus.emit("CELL_CLICK", { cell });
  };

  // 修正: any を ThreeEvent<MouseEvent> に変更
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
    <group position={[posX, 0, posZ]}>
      <mesh
        rotation={[DESIGN.BOARD.DEFAULT_ROTATION_X, 0, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry
          args={[DESIGN.BOARD.CELL_SIZE, DESIGN.BOARD.CELL_SIZE]}
        />
        <meshStandardMaterial
          color={getCellColor()}
          emissive={getEmissive()}
          emissiveIntensity={isSelected || isHovered ? 0.5 : 0}
        />
      </mesh>
    </group>
  );
};

/**
 * GameBoard3D Feature Component
 */
const GameBoard3D: React.FC = () => {
  const field = useGameQuery.useField();
  const boardRef = useRef<Group>(null);

  if (!field || !field.cells) return null;

  return (
    <group ref={boardRef}>
      {field.cells.flat().map((cell) => (
        <Cell key={`${cell.x}-${cell.y}`} cell={cell} />
      ))}
    </group>
  );
};

export default GameBoard3D;
