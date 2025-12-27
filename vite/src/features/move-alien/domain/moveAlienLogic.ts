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
 * 外来種の移動を試みるロジック
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

  const alien = state.activeAlienInstances[alienInstanceId];
  if (!alien) return "指定された外来種が見つかりません。";

  const originalCard = cardMasterData.find(
    (c) => c.id === alien.cardDefinitionId,
  );
  if (!originalCard) return "外来種の元カード情報が見つかりません。";

  const moveCost = originalCard.cost;
  const currentPlayer = state.playerStates[state.activePlayerId];

  // コストと条件のチェック
  if (currentPlayer.currentEnvironment < moveCost)
    return "移動のためのエンバイロメントが足りません！";

  if (
    targetCell.cellType !== "alien_invasion_area" ||
    targetCell.dominantAlienInstanceId !== alien.instanceId
  )
    return "自身の侵略マスにしか移動できません";

  return produce(state, (draft) => {
    const newAlien = draft.activeAlienInstances[alienInstanceId];
    const newPlayerState = draft.playerStates[draft.activePlayerId];

    // 旧位置を空き地にし、新位置にコアを配置
    draft.gameField.cells[newAlien.currentY][newAlien.currentX] =
      createEmptyAreaCell(newAlien.currentX, newAlien.currentY);

    draft.gameField.cells[targetCell.y][targetCell.x] = createAlienCoreCell(
      targetCell.x,
      targetCell.y,
      newAlien.instanceId,
    );

    // インスタンス情報の更新
    newAlien.currentX = targetCell.x;
    newAlien.currentY = targetCell.y;
    newAlien.turnsSinceLastAction = 0; // 行動したため成長カウントをリセット
    newPlayerState.currentEnvironment -= moveCost;
  });
};