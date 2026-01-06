// vite/src/features/play-card/logic.ts

import { v4 as uuidv4 } from "uuid";
import {
  GameState,
  CardDefinition,
  AlienCardDefinition,
  EradicationCardDefinition,
  RecoveryCardDefinition,
  CellState,
  AlienInstance,
} from "@/shared/types";
import { Point, GridShape, PlayerId } from "@/shared/types/primitives";
import { FieldUtils } from "@/core/api/utils";
import { cardMasterData } from "@/shared/data/cardMasterData";

/**
 * カードプレイ実行のメインロジック
 */
export const executeCardEffect = (
  gameState: GameState,
  card: CardDefinition,
  targetPoint: Point,
): GameState => {
  console.group(`[PlayCard] 🃏 Action: ${card.name} (ID: ${card.id})`);
  console.log(`Target: [x:${targetPoint.x}, y:${targetPoint.y}]`);

  let nextState = gameState;
  switch (card.cardType) {
    case "alien":
      nextState = executeAlienCard(gameState, card, targetPoint);
      break;
    case "eradication":
      nextState = executeEradicationCard(gameState, card, targetPoint);
      break;
    case "recovery":
      nextState = executeRecoveryCard(gameState, card, targetPoint);
      break;
    default:
      console.warn("[PlayCard] ⚠️ Unknown card type");
      break;
  }

  console.groupEnd();
  return nextState;
};

/**
 * 🌵 外来種カードの実行
 */
const executeAlienCard = (
  gameState: GameState,
  card: AlienCardDefinition,
  targetPoint: Point
): GameState => {
  const { gameField, alienInstances, currentRound } = gameState;
  const targetCell = FieldUtils.getCell(gameField, targetPoint);

  // バリデーションログ
  if (!targetCell) {
    console.warn(`[PlayCard] ❌ Failed: Target [${targetPoint.x}, ${targetPoint.y}] is out of bounds.`);
    return gameState;
  }

  if (targetCell.type !== "bare") {
    console.warn(`[PlayCard] ❌ Failed: Invalid target type '${targetCell.type}'. Alien seeds require 'bare'.`);
    return gameState;
  }

  // 実行
  const newInstanceId = uuidv4();
  const newInstance: AlienInstance = {
    instanceId: newInstanceId,
    cardDefinitionId: card.id,
    spawnedRound: currentRound,
    status: "seed",
    currentX: targetPoint.x,
    currentY: targetPoint.y,
  };

  const newCell: CellState = {
    ...targetCell,
    type: "alien",
    ownerId: "alien",
    alienUnitId: newInstanceId,
  };

  console.info(`[PlayCard] ✅ Success: Placed Seed at [${targetPoint.x}, ${targetPoint.y}]`);

  return {
    ...gameState,
    gameField: FieldUtils.updateCell(gameField, newCell),
    alienInstances: {
      ...alienInstances,
      [newInstanceId]: newInstance,
    },
  };
};

/**
 * 🧹 駆除カードの実行
 */
const executeEradicationCard = (
  gameState: GameState,
  card: EradicationCardDefinition,
  targetPoint: Point
): GameState => {
  const { eradicationRange, eradicationType, postState, chainDestruction } = card;
  let currentGameState = { ...gameState };
  let removedCount = 0;
  let affectedCount = 0;

  const targetPoints = getCellsByShape(
    currentGameState.gameField.width,
    currentGameState.gameField.height,
    targetPoint,
    eradicationRange
  );

  console.log(`[PlayCard] Eradication Area: ${targetPoints.length} cells (Shape: ${eradicationRange})`);

  targetPoints.forEach((p) => {
    const cell = FieldUtils.getCell(currentGameState.gameField, p);
    if (!cell) return;

    // 1. 外来種ユニットの処理
    if (cell.type === "alien") {
      const unitId = cell.alienUnitId;

      if (unitId) {
        const instance = currentGameState.alienInstances[unitId];
        if (instance) {
          const masterData = getCardDefinition(instance.cardDefinitionId);
          const hasCounter = masterData?.counterAbility === "spread_seed";

          // 反撃判定 (物理駆除 かつ 反撃能力持ち)
          if (eradicationType === "physical" && hasCounter) {
            console.warn(`[PlayCard] ⚠️ Counter Ability Triggered at [${p.x}, ${p.y}]!`);
            // 駆除される外来種のIDを渡して反撃を発動
            currentGameState = triggerCounterEffect(currentGameState, p, instance.cardDefinitionId);
          }

          const newAlienInstances = { ...currentGameState.alienInstances };
          delete newAlienInstances[unitId];
          currentGameState.alienInstances = newAlienInstances;
          removedCount++;

          if (chainDestruction && instance.status === "plant") {
            // TODO: Chain destruction logic log
            console.log("[PlayCard] (TODO) Chain destruction logic triggered");
          }
        }
      }
    }

    // 2. 地形の変更処理
    // 外来種だけでなく、在来種(native)や先駆植生(pioneer)も範囲内なら巻き込まれて postState になる
    const isTerrainChangeNeeded = cell.type !== postState;

    if (isTerrainChangeNeeded || cell.type === "alien") {
      const newCell: CellState = {
        ...cell,
        type: postState === "pioneer" ? "pioneer" : "bare",
        ownerId: null,
        alienUnitId: undefined,
      };
      currentGameState.gameField = FieldUtils.updateCell(
        currentGameState.gameField,
        newCell
      );
      affectedCount++;
    }
  });

  console.info(`[PlayCard] ✅ Success: Removed ${removedCount} alien units, Affected ${affectedCount} cells.`);

  return currentGameState;
};

/**
 * 🌱 回復カードの実行
 */
const executeRecoveryCard = (
  gameState: GameState,
  card: RecoveryCardDefinition,
  targetPoint: Point
): GameState => {
  const { recoveryRange, recoveryPower } = card;
  const currentGameState = { ...gameState };
  let recoveredCount = 0;

  const targetPoints = getCellsByShape(
    currentGameState.gameField.width,
    currentGameState.gameField.height,
    targetPoint,
    recoveryRange
  );

  targetPoints.forEach((p) => {
    const cell = FieldUtils.getCell(currentGameState.gameField, p);
    if (!cell) return;

    if (cell.type === "bare" || cell.type === "pioneer") {
      let nextType: CellState["type"] = cell.type;
      let nextOwner: string | null = cell.ownerId;

      if (cell.type === "bare") {
        if (recoveryPower >= 2) {
          nextType = "native";
          nextOwner = "native";
        } else {
          nextType = "pioneer";
          nextOwner = null;
        }
      } else if (cell.type === "pioneer") {
        if (recoveryPower >= 3) {
          nextType = "native";
          nextOwner = "native";
        }
      }

      if (nextType !== cell.type) {
        const newCell: CellState = {
          ...cell,
          type: nextType,
          ownerId: nextOwner as PlayerId,
        };
        currentGameState.gameField = FieldUtils.updateCell(
          currentGameState.gameField,
          newCell
        );
        recoveredCount++;
      }
    }
  });

  console.info(`[PlayCard] ✅ Success: Recovered ${recoveredCount} cells.`);

  return currentGameState;
};

/**
 * 反撃効果 (Counter Effect)
 * 駆除された外来種が種を撒き散らす
 */
const triggerCounterEffect = (gameState: GameState, center: Point, originCardId: string): GameState => {
  const newState = { ...gameState };
  const { gameField } = newState;

  const neighbors = getCellsByShape(gameField.width, gameField.height, center, "range");

  const bareNeighbors = neighbors.filter(p => {
    const c = FieldUtils.getCell(gameField, p);
    return c?.type === "bare";
  });

  // 裸地があれば最大2つまで種を配置
  const seedCount = Math.min(bareNeighbors.length, 2);
  if (seedCount === 0) return newState;

  const shuffled = bareNeighbors.sort(() => 0.5 - Math.random());
  const targets = shuffled.slice(0, seedCount);

  console.log(`[Counter] Spawning ${seedCount} seeds around [${center.x}, ${center.y}] from ${originCardId}`);

  targets.forEach(p => {
    const newId = uuidv4();
    const newInstance: AlienInstance = {
      instanceId: newId,
      cardDefinitionId: originCardId, // 元の外来種IDを引き継ぐ
      spawnedRound: newState.currentRound,
      status: "seed",
      currentX: p.x,
      currentY: p.y,
    };

    const cell = FieldUtils.getCell(newState.gameField, p)!;
    const newCell: CellState = {
      ...cell,
      type: "alien",
      ownerId: "alien",
      alienUnitId: newId,
    };

    newState.gameField = FieldUtils.updateCell(newState.gameField, newCell);
    newState.alienInstances = {
      ...newState.alienInstances,
      [newId]: newInstance,
    };
  });

  return newState;
};

/**
 * ヘルパー: 範囲取得
 * UI(ガイド)からも使用するため export する
 */
export const getCellsByShape = (
  width: number,
  height: number,
  center: Point,
  shape: GridShape
): Point[] => {
  const points: Point[] = [];
  const { x, y } = center;

  const addIfValid = (tx: number, ty: number) => {
    if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
      points.push({ x: tx, y: ty });
    }
  };

  switch (shape) {
    case "point":
      addIfValid(x, y);
      break;
    case "vertical":
      addIfValid(x, y);
      addIfValid(x, y - 1);
      addIfValid(x, y + 1);
      break;
    case "horizon":
      addIfValid(x, y);
      addIfValid(x - 1, y);
      addIfValid(x + 1, y);
      break;
    case "cross":
      addIfValid(x, y);
      addIfValid(x, y - 1);
      addIfValid(x, y + 1);
      addIfValid(x - 1, y);
      addIfValid(x + 1, y);
      break;
    case "x_cross":
      addIfValid(x, y);
      addIfValid(x - 1, y - 1);
      addIfValid(x + 1, y - 1);
      addIfValid(x - 1, y + 1);
      addIfValid(x + 1, y + 1);
      break;
    case "range":
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          addIfValid(x + dx, y + dy);
        }
      }
      break;
  }
  return points;
};

const getCardDefinition = (id: string): AlienCardDefinition | undefined => {
  return cardMasterData.find(c => c.id === id && c.cardType === "alien") as AlienCardDefinition;
};