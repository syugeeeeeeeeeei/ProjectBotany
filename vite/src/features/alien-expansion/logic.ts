// vite/src/features/alien-expansion/logic.ts

import {
  GameState,
  CellState,
  AlienCardDefinition,
} from "@/shared/types";
import { GridShape, Point } from "@/shared/types/primitives";
import { cardMasterData } from "@/shared/data/cardMasterData";

/**
 * 外来種の拡散処理 (Expansion)
 */
export const processAlienExpansion = (gameState: GameState): GameState => {
  const { alienInstances, gameField } = gameState;
  const nextCells = gameField.cells.map(row => [...row]);
  let isFieldUpdated = false;

  Object.values(alienInstances).forEach((instance) => {
    if (instance.status !== "plant") {
      return;
    }

    const cardDef = getAlienCardDefinition(instance.cardDefinitionId);
    if (!cardDef) return;

    const { expansionPower, expansionRange } = cardDef;
    const center = { x: instance.currentX, y: instance.currentY };
    const targetPoints = calculateExpansionArea(
      gameField.width,
      gameField.height,
      center,
      expansionRange,
      expansionPower
    );

    targetPoints.forEach((p) => {
      const currentCell = nextCells[p.y][p.x];
      if (p.x === center.x && p.y === center.y) return;

      // 修正: 引数を削除
      if (canInvade(currentCell)) {
        const newCell: CellState = {
          ...currentCell,
          type: "alien",
          ownerId: "alien",
          alienUnitId: currentCell.alienUnitId,
        };

        nextCells[p.y][p.x] = newCell;
        isFieldUpdated = true;
      }
    });
  });

  if (!isFieldUpdated) {
    return gameState;
  }

  return {
    ...gameState,
    gameField: {
      ...gameField,
      cells: nextCells,
    },
  };
};

// --- ヘルパー関数 ---

/**
 * 侵略可能かどうかの判定
 */
const canInvade = (
  targetCell: CellState
): boolean => {
  if (targetCell.type !== "alien") {
    return true;
  }
  if (targetCell.alienUnitId) {
    return false;
  }
  return false;
};

const getAlienCardDefinition = (id: string): AlienCardDefinition | undefined => {
  return cardMasterData.find(
    (c) => c.id === id && c.cardType === "alien"
  ) as AlienCardDefinition;
};

const calculateExpansionArea = (
  width: number,
  height: number,
  center: Point,
  shape: GridShape,
  power: number
): Point[] => {
  const points: Point[] = [];
  const { x: cx, y: cy } = center;

  const addIfValid = (tx: number, ty: number) => {
    if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
      points.push({ x: tx, y: ty });
    }
  };

  for (let d = 1; d <= power; d++) {
    switch (shape) {
      case "point":
        break;
      case "vertical":
        addIfValid(cx, cy - d);
        addIfValid(cx, cy + d);
        break;
      case "horizon":
        addIfValid(cx - d, cy);
        addIfValid(cx + d, cy);
        break;
      case "cross":
        addIfValid(cx, cy - d);
        addIfValid(cx, cy + d);
        addIfValid(cx - d, cy);
        addIfValid(cx + d, cy);
        break;
      case "x_cross":
        addIfValid(cx - d, cy - d);
        addIfValid(cx + d, cy - d);
        addIfValid(cx - d, cy + d);
        addIfValid(cx + d, cy + d);
        break;
      case "range":
        for (let dy = -d; dy <= d; dy++) {
          for (let dx = -d; dx <= d; dx++) {
            if (Math.abs(dx) === d || Math.abs(dy) === d) {
              addIfValid(cx + dx, cy + dy);
            }
          }
        }
        break;
    }
  }

  return points;
};