// vite/src/features/Alien/Expansion/logic.ts

import {
  GameState,
  CellState,
  AlienCardDefinition,
} from "@/shared/types";
import { GridShape, Point } from "@/shared/types/primitives";
import { cardMasterData } from "@/shared/data/cardMasterData";

/**
 * 外来種の拡散処理 (Expansion)
 * * 【連鎖拡散ロジックへの修正】
 * - Core（トークン位置）だけでなく、その植物が支配している全マスを起点に拡散を計算します。
 * - 拡散によって生成された新しい外来種マスにも `alienUnitId` を付与し、次ラウンドの起点にします。
 */
export const processAlienExpansion = (gameState: GameState): GameState => {
  const { alienInstances, gameField } = gameState;
  const nextCells = gameField.cells.map(row => [...row]);
  let isFieldUpdated = false;
  let totalInvadedCount = 0;

  console.group("[Feature: Alien Expansion] Processing Chain Expansion...");

  // 各外来種インスタンス（Core）ごとに処理
  Object.values(alienInstances).forEach((instance) => {
    // 成体 (plant) のみが拡散能力を持つ
    if (instance.status !== "plant") {
      return;
    }

    const cardDef = getAlienCardDefinition(instance.cardDefinitionId);
    if (!cardDef) return;

    const { expansionPower, expansionRange } = cardDef;

    // 1. このインスタンスに属する全てのマス（Coreおよび既に侵食済みのマス）を特定する
    const sourcePoints: Point[] = [];
    gameField.cells.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.alienUnitId === instance.instanceId) {
          sourcePoints.push({ x, y });
        }
      });
    });

    // 2. 各支配マスを起点として、カード定義の範囲・力で拡散を計算
    sourcePoints.forEach((source) => {
      const targetPoints = calculateExpansionArea(
        gameField.width,
        gameField.height,
        source,
        expansionRange,
        expansionPower
      );

      targetPoints.forEach((p) => {
        // 更新中のフィールド(nextCells)ではなく、元のフィールド(gameField.cells)を参照して判定
        // (1回の処理で無限に増殖するのを防ぐため)
        const currentCell = gameField.cells[p.y][p.x];

        // 侵食可能判定（在来種・先駆植生・裸地）
        if (canInvade(currentCell)) {
          // すでに今回のループで他のマスから侵食済みでないかチェック
          if (nextCells[p.y][p.x].type === "alien") return;

          const newCell: CellState = {
            ...currentCell,
            type: "alien",
            ownerId: "alien",
            // 重要: このマスをこのインスタンスの支配下として登録することで、次ラウンドの拡散起点にする
            alienUnitId: instance.instanceId,
          };

          nextCells[p.y][p.x] = newCell;
          isFieldUpdated = true;
          totalInvadedCount++;
        }
      });
    });
  });

  if (!isFieldUpdated) {
    console.log("[Expansion] No new invasions occurred.");
    console.groupEnd();
    return gameState;
  }

  console.info(`[Expansion] 🌊 Chain expansion completed. Total ${totalInvadedCount} cells invaded.`);
  console.groupEnd();

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
 * 要件: 「在来種マス(native)」「先駆植生マス(pioneer)」「裸地マス(bare)」を対象とする
 */
const canInvade = (targetCell: CellState): boolean => {
  const t = targetCell.type;
  // 外来種(alien)以外の3種であれば侵食可能
  return t === "native" || t === "pioneer" || t === "bare";
};

const getAlienCardDefinition = (id: string): AlienCardDefinition | undefined => {
  return cardMasterData.find(
    (c) => c.id === id && c.cardType === "alien"
  ) as AlienCardDefinition;
};

/**
 * 形状と拡散力に基づいた範囲計算
 */
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
      default:
        break;
    }
  }

  return points;
};