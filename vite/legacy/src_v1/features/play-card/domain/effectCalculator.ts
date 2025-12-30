import {
  CardDefinition,
  CellState,
  FieldState,
  EradicationCard,
  RecoveryCard,
} from "@/shared/types/game-schema";

/**
 * カード効果範囲計算ロジック (effectCalculator)
 * 
 * 【動機】
 * 盤面上のターゲットマスに対して、カードが持つ「形状（Shape）」と「パワー（Power）」に基づき、
 * どこのマスに影響が及ぶかを厳密に計算するためです。
 * 在来種・外来種の視点（Facing Factor）に応じて、直線効果の向きを反転させる等の
 * ゲーム特有の幾何学的計算を一箇所に集約します。
 *
 * 【恩恵】
 * - 「周囲1マス」「十字」「特定の種族全体」といった多様なターゲティング規則を
 *   純粋関数として実装しているため、テストが容易で再利用性が高いです。
 * - UI（プレビュー表示）とロジック（実際の効果適用）で全く同じ計算を共有することで、
 *   「見た目と実際の挙動の乖離」を防ぎます。
 *
 * 【使用法】
 * プレビュー表示時のアウトライン計算や、`playCardLogic.ts` での実際の盤面更新時に使用されます。
 */
/**
 * 基底的な効果範囲計算（getEffectRange）
 * カードの `targeting` 定義に基づき、物理的なマスのリストを生成するために必要です
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

  // 「特定の生物種全体」をターゲットとする場合
  if ("target" in card.targeting && card.targeting.target === "species") {
    const dominantId =
      (targetCell.cellType === "alien_core" && targetCell.alienInstanceId) ||
      (targetCell.cellType === "alien_invasion_area" &&
        targetCell.dominantAlienInstanceId);

    // ヒットしたマスの持ち主と同じインスタンスIDを持つ全てのマスをリストアップ
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
    // 形状（Shape）に基づいた幾何学的な範囲計算
    const targeting = card.targeting as {
      shape: "single" | "cross" | "range" | "straight";
      power: number;
      direction?: string;
    };

    const { power, shape } = targeting;
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
        // 矩形範囲（全方位）
        for (let y = cy - (power - 1); y <= cy + (power - 1); y++) {
          for (let x = cx - (power - 1); x <= cx + (power - 1); x++) {
            coords.push({ x, y });
          }
        }
        break;
      case "straight": {
        // 直線方向。facingFactor を乗じてプレイヤーの向きに味付けする
        const direction = targeting.direction || "vertical";
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

  // 盤面外の座標を除外し、実際のセルオブジェクトを返却
  return coords
    .filter((c) => c.x >= 0 && c.x < width && c.y >= 0 && c.y < height)
    .map((c) => cells[c.y][c.x]);
};

/**
 * 駆除カードの影響範囲を計算する
 */
export const calculateEradicationImpact = (
  card: EradicationCard,
  targetCell: CellState,
  field: FieldState,
  facingFactor: 1 | -1,
): CellState[] => {
  return getEffectRange(card, targetCell, field, facingFactor);
};

/**
 * 回復カードの影響範囲を計算する
 */
export const calculateRecoveryImpact = (
  card: RecoveryCard,
  targetCell: CellState,
  field: FieldState,
  facingFactor: 1 | -1,
): CellState[] => {
  return getEffectRange(card, targetCell, field, facingFactor);
};
