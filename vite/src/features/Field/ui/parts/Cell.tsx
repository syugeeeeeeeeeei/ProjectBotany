import React from "react";
import { CellState } from "@/shared/types/game-schema";
import { DESIGN } from "@/shared/constants/design-tokens";
import { useCellLogic } from "../../hooks/useCellLogic";

interface CellProps {
  cell: CellState;
}

export const Cell: React.FC<CellProps> = ({ cell }) => {
  const { styles, handlers } = useCellLogic(cell);

  const posX = (cell.x - (7 - 1) / 2) * DESIGN.BOARD.CELL_GAP;
  const posZ = (cell.y - (10 - 1) / 2) * DESIGN.BOARD.CELL_GAP;

  return (
    <mesh
      position={[posX, 0, posZ]}
      rotation={[DESIGN.BOARD.DEFAULT_ROTATION_X, 0, 0]}
      onPointerOver={handlers.handlePointerOver}
      onPointerOut={handlers.handlePointerOut}
      // onPointerUp の代わりに onClick を使用するケースも考えられるが、
      // ドラッグ操作との兼ね合いでCellは onPointerUp が適している場合が多い。
      // ただし今回は一貫性を保つため、Logic側で handleClick として定義し、
      // ここでは onPointerUp (Release) で発火させる。
      onPointerUp={handlers.handleClick}
    >
      <planeGeometry args={[DESIGN.BOARD.CELL_SIZE, DESIGN.BOARD.CELL_SIZE]} />
      <meshStandardMaterial
        color={styles.cellColor}
        emissive={styles.emissiveColor}
        emissiveIntensity={styles.emissiveIntensity}
      />
    </mesh>
  );
};
