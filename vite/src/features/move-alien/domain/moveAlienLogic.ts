import { produce } from "immer";
import { GameState, CellState } from "@/shared/types/game-schema";
import cardMasterData from "@/data/cardMasterData";
import {
  createEmptyAreaCell,
  createAlienCoreCell,
} from "@/features/field-grid/domain/cellHelpers";

/** アクションのペイロード定義 */
interface MoveAlienPayload {
  instanceId: string;
  targetCell: CellState;
}

/**
 * 外来種の移動ロジック (moveAlienLogic)
 * 
 * 【動機】
 * 外来種の「移動」というアクションに伴う盤面の更新、ステータス変更、
 * およびバリデーション（コストチェックや移動範囲の正当性）を厳密に行うためです。
 *
 * 【恩恵】
 * - `produce` (Immer) を使用することで、複雑な 2D 配列の盤面更新とインスタンスの座標更新を
 *   アトミックかつイミュータブルに行い、ストアの整合性を保証します。
 * - 移動時に「成長カウント（turnsSinceLastAction）」をリセットするというルールを適用し、
 *   安易な移動に対するペナルティ（デメリット）を設けてゲームバランスをとっています。
 *
 * 【使用法】
 * `ActionRegistry` に `MOVE_ALIEN` として登録され、`useGameStore` の `dispatch` 経由で実行されます。
 */
/**
 * 外来種の移動ロジックを実行
 * バリデーションチェックを行い、成功すれば盤面とインスタンスの状態を更新するために必要です
 */
export const moveAlienLogic = (
  state: GameState,
  payload: MoveAlienPayload,
): GameState | string => {
  // 🛡️ ガード：外来種の手番でない場合は実行を拒否
  if (state.activePlayerId !== "alien") {
    return "外来種の手番ではありません。";
  }

  const { instanceId: alienInstanceId, targetCell } = payload;

  // 1. 移動する個体の存在確認
  const alien = state.activeAlienInstances[alienInstanceId];
  if (!alien) return "指定された外来種が見つかりません。";

  const originalCard = cardMasterData.find(
    (c) => c.id === alien.cardDefinitionId,
  );
  if (!originalCard) return "外来種の元カード情報が見つかりません。";

  const moveCost = originalCard.cost;
  const currentPlayer = state.playerStates[state.activePlayerId];

  // 2. コストと条件のバリデーション
  if (currentPlayer.currentEnvironment < moveCost)
    return "移動のためのエンバイロメントが足りません！";

  // 移動先が、その個体が支配している「侵略マス」であるかを確認
  if (
    targetCell.cellType !== "alien_invasion_area" ||
    targetCell.dominantAlienInstanceId !== alien.instanceId
  )
    return "自身の侵略マスにしか移動できません";

  // 3. 状態の更新を適用 (Immer によるイミュータブルな変更)
  return produce(state, (draft) => {
    const newAlien = draft.activeAlienInstances[alienInstanceId];
    const newPlayerState = draft.playerStates[draft.activePlayerId];

    // 旧位置のコアを削除し、空き地（empty_area）に戻す
    draft.gameField.cells[newAlien.currentY][newAlien.currentX] =
      createEmptyAreaCell(newAlien.currentX, newAlien.currentY);

    // 新位置にコア（alien_core）を配置
    draft.gameField.cells[targetCell.y][targetCell.x] = createAlienCoreCell(
      targetCell.x,
      targetCell.y,
      newAlien.instanceId,
    );

    // インスタンスの座標情報を更新
    newAlien.currentX = targetCell.x;
    newAlien.currentY = targetCell.y;

    // 行動したため成長カウンタ（経過ターン）をリセットし、コストを消費
    newAlien.turnsSinceLastAction = 0;
    newPlayerState.currentEnvironment -= moveCost;
  });
};