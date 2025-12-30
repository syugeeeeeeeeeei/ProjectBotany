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
 * カード使用実行ロジック (playCardLogic)
 * 
 * 【動機】
 * カードの使用という極めて複雑な盤面遷移を一手に引き受けるためです。
 * コスト消費、クールダウンの開始、実体の生成、範囲内のマスの書き換えなど、
 * 全てのゲームルールの整合性をここで担保します。
 *
 * 【恩恵】
 * - `alien`, `eradication`, `recovery` という異なるタイプのカードに対して、
 *   それぞれ適切な状態遷移（インスタンス追加、除去、再生）を統一的に処理できます。
 * - エラー（コスト不足、クールダウン中、配置条件違反）を文字列として返すことで、
 *   UI 側でのアラート表示を簡潔に実装できます。
 *
 * 【使用法】
 * `ActionRegistry` に `PLAY_CARD` として登録され、`useGameStore` の `dispatch` 経由で呼び出されます。
 */
/**
 * カード使用ロジックの実行
 * プレイヤーの選択をゲームステートに物理的に反映（コスト、クールダウン、盤面変化）するために必要です
 */
export const playCardLogic = (
  state: GameState,
  payload: PlayCardPayload,
): GameState | string => {
  const { card, targetCell, cardId: instanceId } = payload;
  const player = state.playerStates[state.activePlayerId];

  // 1. 各種バリデーション（コスト、クールダウン、配置位置）
  if (player.currentEnvironment < card.cost) {
    return "コストが足りません。";
  }

  const cooldownInfo = player.cooldownActiveCards.find(
    (c) => c.cardId === instanceId,
  );
  if (cooldownInfo) {
    return `クールダウン中です。残り${cooldownInfo.turnsRemaining}ターン`;
  }

  if (card.cardType === "alien") {
    if (targetCell.cellType !== "native_area") {
      return "外来種は在来種エリア（緑色）にのみ配置できます。";
    }
  }

  // 2. 状態更新の適用
  return produce(state, (draft) => {
    const activePlayer = draft.playerStates[draft.activePlayerId];

    // エンバイロメント（リソース）コストを消費
    activePlayer.currentEnvironment -= card.cost;

    // カードをクールダウン状態に設定
    if (card.cooldownTurns) {
      activePlayer.cooldownActiveCards.push({
        cardId: instanceId,
        turnsRemaining: card.cooldownTurns,
      });
    }

    // 3. カードタイプに応じた特殊処理
    if (card.cardType === "alien") {
      // --- 外来種：新しいインスタンスを生成して配置 ---
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
      // --- 駆除：範囲内の外来種を除去 ---
      const impactCells = calculateEradicationImpact(
        card,
        targetCell,
        state.gameField,
        activePlayer.facingFactor,
      );
      impactCells.forEach((c: CellState) => {
        const cell = draft.gameField.cells[c.y][c.x];
        if (
          cell.cellType === "alien_invasion_area" ||
          cell.cellType === "alien_core"
        ) {
          // コアを破壊した場合はインスタンス自体を削除
          if (cell.cellType === "alien_core") {
            delete draft.activeAlienInstances[cell.alienInstanceId];
          }
          // 駆除後の状態設定（更地にするか、再生待機にするか）
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
      // --- 回復：範囲内の土地を再生 ---
      const impactCells = calculateRecoveryImpact(
        card,
        targetCell,
        state.gameField,
        activePlayer.facingFactor,
      );
      impactCells.forEach((c: CellState) => {
        const cell = draft.gameField.cells[c.y][c.x];
        // 空き地または再生待機状態のマスのみ回復可能
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
