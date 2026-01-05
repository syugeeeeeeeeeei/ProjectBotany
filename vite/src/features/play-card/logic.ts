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
import { FieldSystem } from "@/core/systems/FieldSystem";

/**
 * カードプレイ実行のメインロジック
 * * @param gameState 現在のゲーム状態
 * @param card 使用するカードの定義
 * @param targetPoint ターゲット座標
 * @param playerId 使用したプレイヤーID
 * @returns 更新された新しいゲーム状態
 */
export const executeCardEffect = (
  gameState: GameState,
  card: CardDefinition,
  targetPoint: Point,
): GameState => {
  // 共通: コスト消費処理 (簡易実装: 実際はPlayerStateのAPを減らす処理が必要)
  // const newPlayerStates = consumeAP(gameState.playerStates, playerId, card.cost);
  // ここではゲームルールのロジックに集中するため、AP消費は省略または呼び出し元で行う想定とします

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
 * 裸地に「種」インスタンスを生成する
 */
const executeAlienCard = (
  gameState: GameState,
  card: AlienCardDefinition,
  targetPoint: Point
): GameState => {
  const { gameField, alienInstances, currentRound } = gameState;
  const targetCell = FieldSystem.getCell(gameField, targetPoint);

  // ルール: 裸地(bare)にしか置けない
  if (!targetCell || targetCell.type !== "bare") {
    console.warn("Invalid target: Alien seeds can only be placed on Bare Ground.");
    return gameState;
  }

  // 1. 新しい外来種インスタンスの作成
  const newInstanceId = uuidv4();
  const newInstance: AlienInstance = {
    instanceId: newInstanceId,
    cardDefinitionId: card.id,
    spawnedRound: currentRound, // 現在のラウンドで生成 (このターンは成長しない)
    status: "seed", // 初期状態は「種」
    currentX: targetPoint.x,
    currentY: targetPoint.y,
  };

  // 2. マスの状態更新
  const newCell: CellState = {
    ...targetCell,
    type: "alien", // 赤マスになる
    ownerId: "alien",
    alienUnitId: newInstanceId, // ユニット紐付け
  };

  // 3. State更新
  return {
    ...gameState,
    gameField: FieldSystem.updateCell(gameField, newCell),
    alienInstances: {
      ...alienInstances,
      [newInstanceId]: newInstance,
    },
  };
};

/**
 * 🧹 駆除カードの実行
 * 物理/完全駆除の分岐、および反撃(Counter)処理を行う
 */
const executeEradicationCard = (
  gameState: GameState,
  card: EradicationCardDefinition,
  targetPoint: Point
): GameState => {
  const { eradicationRange, eradicationType, postState, chainDestruction } = card;
  let currentGameState = { ...gameState };

  // 1. 効果範囲のセルを取得
  const targetPoints = getCellsByShape(
    currentGameState.gameField.width,
    currentGameState.gameField.height,
    targetPoint,
    eradicationRange
  );

  // 2. 各セルに対して駆除を実行
  targetPoints.forEach((p) => {
    const cell = FieldSystem.getCell(currentGameState.gameField, p);
    if (!cell) return;

    // 対象が「外来種マス(alien)」の場合のみ処理
    if (cell.type === "alien") {
      // ユニット(Core/Seed)がいるか確認
      const unitId = cell.alienUnitId;

      if (unitId) {
        // --- ユニットがいる場合 (Core or Seed) ---
        const instance = currentGameState.alienInstances[unitId];
        if (!instance) return; // エラーハンドリング

        // A. 反撃判定 (物理駆除 かつ 反撃能力あり)
        // ※カードデータ側の反撃能力定義を参照する必要があるが、
        //   簡易的に「物理駆除なら反撃チェック」を行う
        const masterData = getCardDefinition(instance.cardDefinitionId); // ※ヘルパー関数が必要
        const hasCounter = masterData?.counterAbility === "spread_seed";

        if (eradicationType === "physical" && hasCounter) {
          // 反撃発動: 周囲に種をばら撒く
          currentGameState = triggerCounterEffect(currentGameState, p);
        }

        // B. ユニット削除
        const newAlienInstances = { ...currentGameState.alienInstances };
        delete newAlienInstances[unitId];
        currentGameState.alienInstances = newAlienInstances;

        // C. 連鎖駆除 (Chain Destruction)
        if (chainDestruction && instance.status === "plant") {
          // このCoreが支配している(dominantAlienInstanceIdを持つ)マスを全て浄化
          // ※現状のCellState定義には dominantAlienInstanceId がないので、
          //   Step 1の修正で追加したと仮定するか、あるいは周囲のNon-Unit赤マスを消す仕様にする
          //   ここでは「範囲内のNon-Coreマス」はループで消えるため、
          //   広域破壊ロジックは範囲指定で賄う設計とする
        }
      }

      // --- マスの浄化 (共通) ---
      // ユニットがいてもいなくても、マスは指定の状態に戻る
      const newCell: CellState = {
        ...cell,
        type: postState === "pioneer" ? "pioneer" : "bare", // 先駆植生 or 裸地
        ownerId: null,
        alienUnitId: undefined,
      };
      currentGameState.gameField = FieldSystem.updateCell(
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
    const cell = FieldSystem.getCell(currentGameState.gameField, p);
    if (!cell) return;

    // 裸地(bare) または 先駆植生(pioneer) のみが回復対象
    // ※外来種マス(alien)は先に駆除が必要
    if (cell.type === "bare" || cell.type === "pioneer") {
      let nextType: CellState["type"] = cell.type;
      let nextOwner: string | null = cell.ownerId;

      // 回復ロジック
      // Power 1: 裸地 -> 先駆
      // Power 2: 裸地 -> 在来
      // Power 3: 先駆 -> 在来
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
        currentGameState.gameField = FieldSystem.updateCell(
          currentGameState.gameField,
          newCell
        );
      }
    }
  });

  return currentGameState;
};

// --- ヘルパー関数 ---

/**
 * 反撃効果 (Counter Effect)
 * 指定座標の周囲の「裸地」に、ランダムに「種」を生成する
 */
const triggerCounterEffect = (gameState: GameState, center: Point): GameState => {
  const newState = { ...gameState };
  const { gameField } = newState;

  // 周囲8マスを取得
  const neighbors = getCellsByShape(gameField.width, gameField.height, center, "range");

  // 裸地のみ抽出
  const bareNeighbors = neighbors.filter(p => {
    const c = FieldSystem.getCell(gameField, p);
    return c?.type === "bare";
  });

  // ランダムに1〜2個選んで種にする
  const seedCount = Math.min(bareNeighbors.length, 2); // 最大2個
  const shuffled = bareNeighbors.sort(() => 0.5 - Math.random());
  const targets = shuffled.slice(0, seedCount);

  targets.forEach(p => {
    // 簡易的にナガミヒナゲシ(alien-1)の種を発生させる
    // ※本来は「元の外来種のID」を引き継ぐべきだが、簡略化のため固定IDまたは別途ロジックが必要
    const counterCardId = "alien-1";

    // 種生成 (executeAlienCard相当の処理をインライン展開)
    const newId = uuidv4();
    const newInstance: AlienInstance = {
      instanceId: newId,
      cardDefinitionId: counterCardId,
      spawnedRound: newState.currentRound, // ★現在のラウンドなので、このターンの成長はしない
      status: "seed",
      currentX: p.x,
      currentY: p.y,
    };

    // State更新
    const cell = FieldSystem.getCell(newState.gameField, p)!;
    const newCell: CellState = {
      ...cell,
      type: "alien",
      ownerId: "alien",
      alienUnitId: newId,
    };

    newState.gameField = FieldSystem.updateCell(newState.gameField, newCell);
    newState.alienInstances = {
      ...newState.alienInstances,
      [newId]: newInstance,
    };
  });

  return newState;
};

/**
 * 形状に基づいてセル座標の配列を取得するユーティリティ
 */
const getCellsByShape = (
  width: number,
  height: number,
  center: Point,
  shape: GridShape
): Point[] => {
  const points: Point[] = [];
  const { x, y } = center;

  // 範囲内判定ヘルパー
  const addIfValid = (tx: number, ty: number) => {
    if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
      points.push({ x: tx, y: ty });
    }
  };

  switch (shape) {
    case "point":
      addIfValid(x, y);
      break;
    case "vertical": // 縦一列 (実際は上下1マスずつとするか、列全体とするかは要件次第。ここでは上下1マス)
      addIfValid(x, y);
      addIfValid(x, y - 1);
      addIfValid(x, y + 1);
      break;
    case "horizon": // 横一列
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
    case "range": // 周囲8マス
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          addIfValid(x + dx, y + dy);
        }
      }
      break;
  }
  return points;
};

// ※実際の実装では cardMasterData をインポートして参照する
import { cardMasterData } from "@/shared/data/cardMasterData";
const getCardDefinition = (id: string): AlienCardDefinition | undefined => {
  return cardMasterData.find(c => c.id === id && c.cardType === "alien") as AlienCardDefinition;
};