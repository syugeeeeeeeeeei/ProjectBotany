import { produce } from "immer";
import {
  GameState,
  CardDefinition,
  CellState,
} from "@/shared/types/game-schema";
import {
  createAlienCoreCell,
  createEmptyAreaCell,
  createNativeAreaCell,
  createRecoveryPendingAreaCell,
} from "@/features/field-grid/domain/cellHelpers";
import {
  calculateEradicationImpact,
  calculateRecoveryImpact,
} from "./effectCalculator";
import { generateId } from "@/shared/utils/id";

/** アクションのペイロード定義 */
interface PlayCardPayload {
  card: CardDefinition;
  targetCell: CellState;
  cardId: string;
}

/**
 * カードを使用するロジック
 */
export const playCardLogic = (
  state: GameState,
  payload: PlayCardPayload,
): GameState | string => {
  const { card, targetCell, cardId: instanceId } = payload;
  const player = state.playerStates[state.activePlayerId];

  // 1. コストチェック
  if (player.currentEnvironment < card.cost) {
    return "コストが足りません。";
  }

  // 2. クールダウンチェック
  const cooldownInfo = player.cooldownActiveCards.find(
    (c) => c.cardId === instanceId,
  );
  if (cooldownInfo) {
    return `クールダウン中です。残り${cooldownInfo.turnsRemaining}ターン`;
  }

  // 3. 配置・使用条件チェック
  if (card.cardType === "alien") {
    if (targetCell.cellType !== "native_area") {
      return "外来種は在来種エリア（緑色）にのみ配置できます。";
    }
  }

  return produce(state, (draft) => {
    const activePlayer = draft.playerStates[draft.activePlayerId];

    // コスト消費
    activePlayer.currentEnvironment -= card.cost;

    // クールダウン設定
    if (card.cooldownTurns) {
      activePlayer.cooldownActiveCards.push({
        cardId: instanceId,
        turnsRemaining: card.cooldownTurns,
      });
    }

    // カード効果の適用
    if (card.cardType === "alien") {
      // 外来種の配置
      const newInstanceId = generateId("alien");
      draft.activeAlienInstances[newInstanceId] = {
        instanceId: newInstanceId,
        cardDefinitionId: card.id,
        currentX: targetCell.x,
        currentY: targetCell.y,
        spawnedTurn: draft.currentTurn,
        currentInvasionPower: card.targeting.power,
        currentInvasionShape: card.targeting.shape,
        currentGrowthStage: 0,
        turnsSinceLastAction: 0,
      };
      draft.gameField.cells[targetCell.y][targetCell.x] = createAlienCoreCell(
        targetCell.x,
        targetCell.y,
        newInstanceId,
      );
    } else if (card.cardType === "eradication") {
      // 駆除効果
      const impactCells = calculateEradicationImpact(
        card,
        targetCell,
        state.gameField,
        activePlayer.facingFactor,
      );
      impactCells.forEach((c: CellState) => {
        const cell = draft.gameField.cells[c.y][c.x];
        // 駆除ロジック: 侵略マスやコアを除去して空き地や再生待機にする
        if (
          cell.cellType === "alien_invasion_area" ||
          cell.cellType === "alien_core"
        ) {
          if (cell.cellType === "alien_core") {
            delete draft.activeAlienInstances[cell.alienInstanceId];
          }
          if (card.postRemovalState === "recovery_pending_area") {
            draft.gameField.cells[c.y][c.x] = createRecoveryPendingAreaCell(
              c.x,
              c.y,
              draft.currentTurn,
            );
          } else {
            draft.gameField.cells[c.y][c.x] = createEmptyAreaCell(c.x, c.y);
          }
        }
      });
    } else if (card.cardType === "recovery") {
      // 回復効果
      const impactCells = calculateRecoveryImpact(
        card,
        targetCell,
        state.gameField,
        activePlayer.facingFactor,
      );
      impactCells.forEach((c: CellState) => {
        const cell = draft.gameField.cells[c.y][c.x];
        if (
          cell.cellType === "empty_area" ||
          cell.cellType === "recovery_pending_area"
        ) {
          if (card.postRecoveryState === "native_area") {
            draft.gameField.cells[c.y][c.x] = createNativeAreaCell(c.x, c.y);
          } else {
            draft.gameField.cells[c.y][c.x] = createRecoveryPendingAreaCell(
              c.x,
              c.y,
              draft.currentTurn,
            );
          }
        }
      });
    }
  });
};
