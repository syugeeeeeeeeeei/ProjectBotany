// vite/src/features/Card/PlayCard/logic.ts

import { v4 as uuidv4 } from "uuid";
import {
  GameState,
  CardDefinition,
  AlienCardDefinition,
  EradicationCardDefinition,
  RecoveryCardDefinition,
  CellState,
  AlienInstance,
  CellType,
  StateTransition,
} from "@/shared/types";
import { Point, GridShape, PlayerId } from "@/shared/types/primitives";
import { FieldUtils } from "@/core/api/utils";
import { cardMasterData } from "@/shared/data/cardMasterData";
import { AlertSystem } from "@/core/systems/AlertSystem";

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

// --- ヘルパー: Transitionマッチング ---
const findMatchingTransition = (
  transitions: StateTransition[],
  cellType: CellType
): StateTransition | undefined => {
  return transitions.find(t => {
    const targets = Array.isArray(t.target) ? t.target : [t.target];
    return targets.includes(cellType);
  });
};

// --- ヘルパー: 全ターゲット収集 ---
const getAllowedTargets = (transitions: StateTransition[]): CellType[] => {
  const all: CellType[] = [];
  transitions.forEach(t => {
    const targets = Array.isArray(t.target) ? t.target : [t.target];
    all.push(...targets);
  });
  return Array.from(new Set(all));
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

  if (!targetCell) return gameState;

  const allowedTargets = getAllowedTargets(card.transition);

  if (!allowedTargets.includes(targetCell.type)) {
    const msg = `そこには配置できません。（対象: ${allowedTargets.join(", ")}）`;
    console.warn(`[PlayCard] ❌ ${msg}`);
    AlertSystem.notify(msg, "error");
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
    type: "alien-core",
    ownerId: "alien",
    alienUnitId: newInstanceId,
  };

  console.info(`[PlayCard] ✅ Success: Placed Seed (Core) at [${targetPoint.x}, ${targetPoint.y}]`);

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
  const { range, eradicationType, preventsCounter, transition } = card;
  let currentGameState = { ...gameState };
  let removedCount = 0;
  let affectedCount = 0;

  // Chain (連鎖) タイプは「対象を選択して発動」する性質上、クリックした場所がCoreである必要がある
  if (eradicationType === "chain") {
    const targetCell = FieldUtils.getCell(currentGameState.gameField, targetPoint);
    if (!targetCell || targetCell.type !== "alien-core") {
      const msg = "連鎖駆除は「外来種(Core)」を指定してください。";
      console.warn(`[PlayCard] ❌ ${msg}`);
      AlertSystem.notify(msg, "error");
      return gameState;
    }
  }

  // 効果範囲内の座標をすべて取得
  let targetPoints: Point[] = [];

  if (eradicationType === "chain") {
    const targetCell = FieldUtils.getCell(currentGameState.gameField, targetPoint);
    if (targetCell && targetCell.alienUnitId) {
      targetPoints = FieldUtils.getCellsByType(currentGameState.gameField, "alien")
        .concat(FieldUtils.getCellsByType(currentGameState.gameField, "alien-core"))
        .filter(p => {
          const c = FieldUtils.getCell(currentGameState.gameField, p);
          return c?.alienUnitId === targetCell.alienUnitId;
        });
    }
  } else {
    targetPoints = getCellsByShape(
      currentGameState.gameField.width,
      currentGameState.gameField.height,
      targetPoint,
      range.shape,
      range.scale
    );
  }

  // ✨ 修正: 効果範囲内に「有効なターゲット」が1つでも存在するかチェックする
  const allowedTargets = getAllowedTargets(transition);
  const hasValidTarget = targetPoints.some(p => {
    const cell = FieldUtils.getCell(currentGameState.gameField, p);
    return cell && allowedTargets.includes(cell.type);
  });

  if (!hasValidTarget) {
    const msg = "効果範囲内に対象が存在しません。";
    console.warn(`[PlayCard] ❌ ${msg}`);
    AlertSystem.notify(msg, "error");
    return gameState;
  }

  // 範囲内の各セルに対して効果適用
  targetPoints.forEach((p) => {
    const cell = FieldUtils.getCell(currentGameState.gameField, p);
    if (!cell) return;

    // 1. 外来種ユニット(Core)の処理
    if (cell.type === "alien-core" && cell.alienUnitId) {
      const unitId = cell.alienUnitId;
      const instance = currentGameState.alienInstances[unitId];

      if (instance) {
        // 反撃判定: Simple駆除 かつ 反撃無効化属性なし
        const isSimple = eradicationType === "simple";
        const masterData = getCardDefinition(instance.cardDefinitionId);
        const hasCounter = masterData?.counterAbility === "spread_seed";

        if (isSimple && !preventsCounter && hasCounter) {
          console.warn(`[PlayCard] ⚠️ Counter Ability Triggered at [${p.x}, ${p.y}]!`);
          currentGameState = triggerCounterEffect(currentGameState, p, instance.cardDefinitionId);
        }

        // インスタンス削除処理
        const newAlienInstances = { ...currentGameState.alienInstances };
        delete newAlienInstances[unitId];
        currentGameState.alienInstances = newAlienInstances;
        removedCount++;
      }
    } else if (cell.type === "alien") {
      removedCount++;
    }

    // 2. 地形の変更処理
    let resultType: CellType | null = null;

    if (eradicationType === "chain" && (cell.type === "alien" || cell.type === "alien-core")) {
      const rule = findMatchingTransition(transition, "alien-core");
      if (rule) resultType = rule.result;
    } else {
      const rule = findMatchingTransition(transition, cell.type);
      if (rule) resultType = rule.result;
    }

    if (resultType) {
      const newCell: CellState = {
        ...cell,
        type: resultType,
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
  const { range, transition } = card;
  const currentGameState = { ...gameState };
  let recoveredCount = 0;

  // 効果範囲内の座標をすべて取得
  const targetPoints = getCellsByShape(
    currentGameState.gameField.width,
    currentGameState.gameField.height,
    targetPoint,
    range.shape,
    range.scale
  );

  // ✨ 修正: 効果範囲内に「有効なターゲット」が1つでも存在するかチェックする
  const allowedTargets = getAllowedTargets(transition);
  const hasValidTarget = targetPoints.some(p => {
    const cell = FieldUtils.getCell(currentGameState.gameField, p);
    return cell && allowedTargets.includes(cell.type);
  });

  if (!hasValidTarget) {
    const msg = "効果範囲内に対象が存在しません。";
    AlertSystem.notify(msg, "error");
    return gameState;
  }

  // 範囲内の各セルに対して効果適用
  targetPoints.forEach((p) => {
    const cell = FieldUtils.getCell(currentGameState.gameField, p);
    if (!cell) return;

    const rule = findMatchingTransition(transition, cell.type);

    if (rule) {
      const nextType = rule.result;
      let nextOwner: string | null = cell.ownerId;
      let pioneerCreatedAt: number | undefined = undefined;

      if (nextType === "native") {
        nextOwner = "native";
      } else if (nextType === "pioneer") {
        nextOwner = null;
        pioneerCreatedAt = currentGameState.currentRound;
      }

      if (nextType !== cell.type) {
        const newCell: CellState = {
          ...cell,
          type: nextType,
          ownerId: nextOwner as PlayerId,
          pioneerCreatedAt: pioneerCreatedAt,
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
 */
const triggerCounterEffect = (gameState: GameState, center: Point, originCardId: string): GameState => {
  const newState = { ...gameState };
  const { gameField } = newState;

  const allBareCells = FieldUtils.getCellsByType(gameField, "bare");
  const candidates = allBareCells.filter(p => !(p.x === center.x && p.y === center.y));

  const countBase = Math.random() < 0.5 ? 2 : 1;
  const seedCount = Math.min(candidates.length, countBase);

  if (seedCount === 0) {
    console.log("[Counter] No available bare cells for counter spread.");
    return newState;
  }

  const shuffled = candidates.sort(() => 0.5 - Math.random());
  const targets = shuffled.slice(0, seedCount);

  console.log(`[Counter] Spawning ${seedCount} seeds (Target: ${countBase}) from ${originCardId}`);

  const originCardDef = getCardDefinition(originCardId);
  const cardName = originCardDef ? originCardDef.name : "外来種";

  AlertSystem.notify(
    `【反撃】${cardName}が種子を拡散しました`,
    "system",
    "broadcast"
  );

  targets.forEach(p => {
    const newId = uuidv4();
    const effectiveSpawnRound = newState.currentRound + 1;

    const newInstance: AlienInstance = {
      instanceId: newId,
      cardDefinitionId: originCardId,
      spawnedRound: effectiveSpawnRound,
      status: "seed",
      currentX: p.x,
      currentY: p.y,
    };

    const cell = FieldUtils.getCell(newState.gameField, p)!;
    const newCell: CellState = {
      ...cell,
      type: "alien-core",
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
export const getCellsByShape = (
  width: number,
  height: number,
  center: Point,
  shape: GridShape,
  scale: number = 1
): Point[] => {
  const points: Point[] = [];
  const { x: cx, y: cy } = center;

  const addIfValid = (tx: number, ty: number) => {
    if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
      points.push({ x: tx, y: ty });
    }
  };

  for (let d = 1; d <= scale; d++) {
    switch (shape) {
      case "point":
        if (d === 1) addIfValid(cx, cy);
        break;
      case "vertical":
        addIfValid(cx, cy);
        addIfValid(cx, cy - d);
        addIfValid(cx, cy + d);
        break;
      case "horizon":
        addIfValid(cx, cy);
        addIfValid(cx - d, cy);
        addIfValid(cx + d, cy);
        break;
      case "cross":
        if (d === 1) addIfValid(cx, cy);
        addIfValid(cx, cy - d);
        addIfValid(cx, cy + d);
        addIfValid(cx - d, cy);
        addIfValid(cx + d, cy);
        break;
      case "x_cross":
        if (d === 1) addIfValid(cx, cy);
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

  if (shape === "point" && points.length === 0) {
    addIfValid(cx, cy);
  }

  const uniquePoints = Array.from(new Set(points.map(p => `${p.x},${p.y}`)))
    .map(s => {
      const [x, y] = s.split(',').map(Number);
      return { x, y };
    });

  return uniquePoints;
};

const getCardDefinition = (id: string): AlienCardDefinition | undefined => {
  return cardMasterData.find(c => c.id === id && c.cardType === "alien") as AlienCardDefinition;
};