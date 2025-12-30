import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { useUIStore } from "@/core/store/uiStore";
import { gameActions } from "@/core/api/actions";
import { PLAY_CARD_ACTION_TYPE, PlayCardPayload } from "./types"; // 型定義を使用

/**
 * カードプレイロジックの初期化
 */
export const initPlayCardLogic = () => {
  gameEventBus.on("CELL_CLICK", ({ cell }) => {
    const { selectedCardId, selectCard } = useUIStore.getState();

    // カードが選択されていない場合は何もしない
    if (!selectedCardId) return;

    // 1. Feature側でPayloadを作成（ここでは型チェックが効く）
    const payload: PlayCardPayload = {
      cardId: selectedCardId,
      targetX: cell.x,
      targetY: cell.y,
    };

    console.log(
      `🃏 Card Played: ${selectedCardId} on Cell (${cell.x}, ${cell.y})`,
    );

    // 2. 履歴に記録 (型定義定数を使用)
    gameActions.history.add(PLAY_CARD_ACTION_TYPE, payload);

    // 3. 効果発動 (今回は簡易実装)
    gameActions.field.mutateCell(cell.x, cell.y, "alien_invasion_area");

    // 4. 選択解除
    selectCard(null);
  });
};
