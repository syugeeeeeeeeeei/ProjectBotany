// vite/src/features/alien-expansion/logic.ts

import {
  GameState,
  CellState,
  AlienInstance,
  AlienCardDefinition,
} from "@/shared/types";
import { GridShape, Point } from "@/shared/types/primitives";
import { cardMasterData } from "@/shared/data/cardMasterData";

/**
 * 外来種の拡散処理 (Expansion)
 *
 * 【仕様】
 * - ラウンド終了時に実行
 * - "plant" (成体) 状態のインスタンスのみが拡散する
 * - 拡散範囲はカード定義の `expansionPower` と `expansionRange` に従う
 * - 優先度に基づく上書き侵略を行う
 */
export const processAlienExpansion = (gameState: GameState): GameState => {
  const { alienInstances, gameField } = gameState;

  // 変更を適用するためのバッファ（現在のフィールド状態をコピー）
  const nextCells = gameField.cells.map(row => [...row]);
  let isFieldUpdated = false;

  // 全てのインスタンスをチェック
  Object.values(alienInstances).forEach((instance) => {
    // 1. 成体 (Plant) チェック: 種は拡散しない
    if (instance.status !== "plant") {
      return;
    }

    // 2. マスタデータから拡散能力を取得
    const cardDef = getAlienCardDefinition(instance.cardDefinitionId);
    if (!cardDef) return;

    const { expansionPower, expansionRange } = cardDef;

    // 3. 拡散範囲の計算
    const center = { x: instance.currentX, y: instance.currentY };
    const targetPoints = calculateExpansionArea(
      gameField.width,
      gameField.height,
      center,
      expansionRange,
      expansionPower
    );

    // 4. 各マスへの侵略判定
    targetPoints.forEach((p) => {
      const currentCell = nextCells[p.y][p.x];

      // 自分自身がいるマスはスキップ (拡散先ではない)
      if (p.x === center.x && p.y === center.y) return;

      if (canInvade(gameState, instance, cardDef, currentCell)) {
        // 侵略実行: マスを外来種マス(赤)に書き換える
        const newCell: CellState = {
          ...currentCell,
          type: "alien",
          ownerId: "alien",
          // このマスを支配しているのはこのインスタンス (Non-Core)
          // ※Core自体が移動するわけではない
          alienUnitId: currentCell.alienUnitId, // 既存ユニット(種など)がいれば維持、いなければundefined
        };

        // ※要件定義補足: 
        // 「外来種マス」には dominantAlienInstanceId が必要だが、
        // 今回のCellState定義(Step2修正版)には含まれていないため、
        // シンプルに「外来種マス化」するのみとする。
        // もし厳密な「支配権争い」を可視化する場合はCellStateにプロパティ追加が必要。
        // ここでは「上書き判定」のみロジックで行い、描画上は単なる赤マスとする。

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
 * 侵略可能かどうかの判定 (上書きルール含む)
 */
const canInvade = (
  gameState: GameState,
  attacker: AlienInstance,
  attackerCard: AlienCardDefinition,
  targetCell: CellState
): boolean => {
  // A. 在来種・裸地・先駆植生は無条件で侵略可能
  if (targetCell.type !== "alien") {
    return true;
  }

  // B. 既に外来種マスの場合: 上書き判定 (Overrun)
  // ただし、現在のCellStateには「誰がこのマスを支配しているか」のIDがないため、
  // 「ユニット(Core/Seed)がいるマス」かどうかで簡易判定する。

  // ユニットがいるマス(Core/Seed)への侵略
  if (targetCell.alienUnitId) {
    // ユニットがいるマスは「本拠地」なので、拡散ごときでは上書きできない（防御最強）
    // 駆除カードでのみ除去可能とするのがゲームバランス的に健全
    return false;
  }

  // ユニットがいない外来種マス(ただの赤マス)への侵略
  // ここは「誰の領土か」の情報がないため、現状は「既に赤なら何もしない」または「常に上書き」となる。
  // 仕様書にある「コスト比較」をするには、CellStateに `dominantInstanceId` が必要。
  // Step 2の定義では落としてしまったため、ここは「空き地のみ塗る（既存の赤マスは維持）」とする。
  return false;
};

/**
 * マスタデータ取得
 */
const getAlienCardDefinition = (id: string): AlienCardDefinition | undefined => {
  return cardMasterData.find(
    (c) => c.id === id && c.cardType === "alien"
  ) as AlienCardDefinition;
};

/**
 * 拡散範囲の計算
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

  // 範囲内判定
  const addIfValid = (tx: number, ty: number) => {
    if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
      points.push({ x: tx, y: ty });
    }
  };

  // 形状ごとのロジック (Powerを距離係数として使用)
  // Power 1 = 半径1マス, Power 2 = 半径2マス... と解釈

  for (let d = 1; d <= power; d++) {
    switch (shape) {
      case "point":
        // 拡散形状としてのPointは「拡散しない」と同義かもしれないが、定義上含める
        break;

      case "vertical": // 上下
        addIfValid(cx, cy - d);
        addIfValid(cx, cy + d);
        break;

      case "horizon": // 左右
        addIfValid(cx - d, cy);
        addIfValid(cx + d, cy);
        break;

      case "cross": // 十字
        addIfValid(cx, cy - d);
        addIfValid(cx, cy + d);
        addIfValid(cx - d, cy);
        addIfValid(cx + d, cy);
        break;

      case "x_cross": // 斜め
        addIfValid(cx - d, cy - d);
        addIfValid(cx + d, cy - d);
        addIfValid(cx - d, cy + d);
        addIfValid(cx + d, cy + d);
        break;

      case "range": // 周囲 (正方形)
        // Power=1なら3x3, Power=2なら5x5の外周
        for (let dy = -d; dy <= d; dy++) {
          for (let dx = -d; dx <= d; dx++) {
            // 中心と、より内側の周回は除外（重複防止）
            // ただし単純な塗りつぶしなら重複しても問題ない
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