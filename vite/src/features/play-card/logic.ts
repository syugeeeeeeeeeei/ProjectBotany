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
// 修正: FieldSystemへの直接依存を廃止し、公開API経由に変更
import { FieldUtils } from "@/core/api/utils";
// ※ cardMasterDataはSharedなのでImport OK
import { cardMasterData } from "@/shared/data/cardMasterData";

/**
 * カードプレイ実行のメインロジック
 */
export const executeCardEffect = (
  gameState: GameState,
  card: CardDefinition,
  targetPoint: Point,
): GameState => {
  switch (card.cardType) {
    case "alien":
      return executeAlienCard(gameState, card, targetPoint);
    case "eradication":
      return executeEradicationCard(gameState, card, targetPoint);
    case "recovery":
      return executeRecoveryCard(gameState, card, targetPoint);
    default:
      return gameState;
  }
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

  if (!targetCell || targetCell.type !== "bare") {
    console.warn("Invalid target: Alien seeds can only be placed on Bare Ground.");
    return gameState;
  }

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

  const targetPoints = getCellsByShape(
    currentGameState.gameField.width,
    currentGameState.gameField.height,
    targetPoint,
    eradicationRange
  );

  targetPoints.forEach((p) => {
    const cell = FieldUtils.getCell(currentGameState.gameField, p);
    if (!cell) return;

    if (cell.type === "alien") {
      const unitId = cell.alienUnitId;

      if (unitId) {
        const instance = currentGameState.alienInstances[unitId];
        if (!instance) return;

        const masterData = getCardDefinition(instance.cardDefinitionId);
        const hasCounter = masterData?.counterAbility === "spread_seed";

        if (eradicationType === "physical" && hasCounter) {
          currentGameState = triggerCounterEffect(currentGameState, p);
        }

        const newAlienInstances = { ...currentGameState.alienInstances };
        delete newAlienInstances[unitId];
        currentGameState.alienInstances = newAlienInstances;

        if (chainDestruction && instance.status === "plant") {
          // TODO: Chain destruction logic
        }
      }

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
    }
  });

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
      }
    }
  });

  return currentGameState;
};

/**
 * 反撃効果 (Counter Effect)
 */
const triggerCounterEffect = (gameState: GameState, center: Point): GameState => {
  const newState = { ...gameState };
  const { gameField } = newState;

  const neighbors = getCellsByShape(gameField.width, gameField.height, center, "range");

  const bareNeighbors = neighbors.filter(p => {
    const c = FieldUtils.getCell(gameField, p);
    return c?.type === "bare";
  });

  const seedCount = Math.min(bareNeighbors.length, 2);
  const shuffled = bareNeighbors.sort(() => 0.5 - Math.random());
  const targets = shuffled.slice(0, seedCount);

  targets.forEach(p => {
    const counterCardId = "alien-1"; // 仮

    const newId = uuidv4();
    const newInstance: AlienInstance = {
      instanceId: newId,
      cardDefinitionId: counterCardId,
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
 */
const getCellsByShape = (
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