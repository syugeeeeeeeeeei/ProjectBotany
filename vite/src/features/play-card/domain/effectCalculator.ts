import {
  CardDefinition,
  CellState,
  FieldState,
} from "@/shared/types/game-schema";

/**
 * カードの効果範囲を計算する。
 */
export const getEffectRange = (
  card: CardDefinition,
  targetCell: CellState,
  field: FieldState,
  facingFactor: 1 | -1,
): CellState[] => {
  const { width, height, cells } = field;
  const { x: cx, y: cy } = targetCell;
  const coords: { x: number; y: number }[] = [];

  if ("target" in card.targeting && card.targeting.target === "species") {
    const dominantId =
      (targetCell.cellType === "alien_core" && targetCell.alienInstanceId) ||
      (targetCell.cellType === "alien_invasion_area" &&
        targetCell.dominantAlienInstanceId);

    if (dominantId) {
      cells.flat().forEach((cell) => {
        if (
          (cell.cellType === "alien_core" &&
            cell.alienInstanceId === dominantId) ||
          (cell.cellType === "alien_invasion_area" &&
            cell.dominantAlienInstanceId === dominantId)
        ) {
          coords.push({ x: cell.x, y: cell.y });
        }
      });
    } else {
      coords.push({ x: cx, y: cy });
    }
  } else {
    const { power, shape } = card.targeting;
    switch (shape) {
      case "single":
        coords.push({ x: cx, y: cy });
        break;
      case "cross":
        coords.push({ x: cx, y: cy });
        for (let i = 1; i <= power; i++) {
          coords.push(
            { x: cx, y: cy + i },
            { x: cx, y: cy - i },
            { x: cx + i, y: cy },
            { x: cx - i, y: cy },
          );
        }
        break;
      case "range":
        for (let y = cy - (power - 1); y <= cy + (power - 1); y++) {
          for (let x = cx - (power - 1); x <= cx + (power - 1); x++) {
            coords.push({ x, y });
          }
        }
        break;
      case "straight": {
        const { direction } = card.targeting;
        const directions = {
          up: [0, -1],
          down: [0, 1],
          left: [-1, 0],
          right: [1, 0],
          vertical: [0, 1, 0, -1],
          horizon: [1, 0, -1, 0],
        };
        const move = directions[direction as keyof typeof directions];
        const yMultiplier =
          direction === "up" || direction === "down" || direction === "vertical"
            ? facingFactor
            : 1;
        for (let i = 1; i <= power; i++) {
          for (let j = 0; j < move.length; j += 2) {
            coords.push({
              x: cx + move[j] * i,
              y: cy + move[j + 1] * i * yMultiplier,
            });
          }
        }
        break;
      }
    }
  }

  return coords
    .filter((c) => c.x >= 0 && c.x < width && c.y >= 0 && c.y < height)
    .map((c) => cells[c.y][c.x]);
};
