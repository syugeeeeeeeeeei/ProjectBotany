import React, { useMemo, useRef } from "react";
import { Group } from "three";
import { InteractionRegistry } from "@/app/registry/InteractionRegistry";
import { useUIStore } from "@/app/store/useUIStore";
import { useGameStore } from "@/app/store/useGameStore";
import type { CellState, FieldState } from "@/shared/types/game-schema";

const BOARD_LAYOUT = {
  CELL_GAP: 1.0,
  CELL_SIZE: 0.9,
  BOARD_WIDTH: 7,
  BOARD_HEIGHT: 10,
  ROTATION_X: -Math.PI / 2,
};

const CELL_COLORS: Record<string, string> = {
  native_area: "#2E7D32",
  alien_core: "#C62828",
  alien_invasion_area: "#E57373",
  empty_area: "#757575",
  recovery_pending_area: "#FDD835",
  default: "#444444",
};

const Cell: React.FC<{ cell: CellState }> = ({ cell }) => {
  const game = useGameStore();
  const ui = useUIStore();

  const decoration = useMemo(() => 
    InteractionRegistry.getCombinedDecoration(cell, game, ui),
    [cell, game, ui]
  );

  // 📢 ここでRegistryから「このマスに重ねるコンポーネント」を取得
  const overlays = useMemo(() =>
    InteractionRegistry.getCellOverlays(cell, game, ui),
    [cell, game, ui]
  );

  return (
    <group 
      position={[
        (cell.x - (BOARD_LAYOUT.BOARD_WIDTH - 1) / 2) * BOARD_LAYOUT.CELL_GAP,
        0,
        (cell.y - (BOARD_LAYOUT.BOARD_HEIGHT - 1) / 2) * BOARD_LAYOUT.CELL_GAP
      ]}
      userData={{ cell }}
    >
      <mesh 
        name="cell-plane" 
        rotation={[BOARD_LAYOUT.ROTATION_X, 0, 0]} 
        onClick={(e) => {
          e.stopPropagation();
          InteractionRegistry.invokeClick(cell, game, ui, game.dispatch);
        }}
      >
        <planeGeometry args={[BOARD_LAYOUT.CELL_SIZE, BOARD_LAYOUT.CELL_SIZE]} />
        <meshStandardMaterial
          color={CELL_COLORS[cell.cellType] || CELL_COLORS.default}
          emissive={decoration.emissiveColor || "black"}
          emissiveIntensity={decoration.emissiveIntensity || 0}
        />
      </mesh>
      {/* 📢 Registryから送られてきたOutline等のコンポーネントをそのまま描画 */}
      {overlays}
    </group>
  );
};

const GameBoard3D: React.FC<{ fieldState: FieldState }> = ({ fieldState }) => {
  const game = useGameStore();
  const ui = useUIStore();
  const boardRef = useRef<Group>(null);

  // 📢 ガイド（PreviewPiece）などのグローバルUIを取得
  const globalComponents = useMemo(() => 
    InteractionRegistry.getGlobalComponents(game, ui, boardRef),
    [game, ui]
  );

  return (
    <group ref={boardRef}>
      {fieldState.cells.flat().map((cell) => (
        <Cell key={`${cell.x}-${cell.y}`} cell={cell} />
      ))}
      {globalComponents}
    </group>
  );
};

export default GameBoard3D;