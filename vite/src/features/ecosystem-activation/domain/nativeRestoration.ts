import { GameState } from "@/shared/types/game-schema";
import {
  createNativeAreaCell,
  createRecoveryPendingAreaCell,
} from "@/features/field-grid/domain/cellHelpers";

/**
 * 在来種サイドの活性フェーズ（自動再生）を実行する。
 */
export const runNativeActivationPhase = (state: GameState) => {
  const cellsToUpdate: {
    x: number;
    y: number;
    cellType: "native" | "pending";
  }[] = [];

  state.gameField.cells.flat().forEach((cell) => {
    if (cell.cellType === "recovery_pending_area")
      cellsToUpdate.push({ x: cell.x, y: cell.y, cellType: "native" });
  });

  cellsToUpdate.forEach((u) => {
    state.gameField.cells[u.y][u.x] = createNativeAreaCell(u.x, u.y);
  });

  const emptyToUpdate: { x: number; y: number }[] = [];
  state.gameField.cells.flat().forEach((cell) => {
    if (cell.cellType === "empty_area")
      emptyToUpdate.push({ x: cell.x, y: cell.y });
  });

  emptyToUpdate.forEach((u) => {
    state.gameField.cells[u.y][u.x] = createRecoveryPendingAreaCell(
      u.x,
      u.y,
      state.currentTurn,
    );
  });
};
