import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { useUIStore } from "@/core/store/uiStore";
import { gameActions, gameQuery } from "@/core/api";
import { FieldSystem } from "@/core/systems/FieldSystem";
import { EffectSystem } from "@/core/systems/EffectSystem";
import { PLAY_CARD_ACTION_TYPE } from "./types";
import cardMasterData from "@/shared/data/cardMasterData";
import { generateId } from "@/shared/utils/id";
import { CellState } from "@/shared/types/game-schema";

/**
 * initPlayCardLogic: カード使用の実処理
 * @returns クリーンアップ関数（イベント購読の解除）
 */
export const initPlayCardLogic = () => {
  const handler = ({ cell: targetCell }: { cell: CellState }) => {
    const { selectedCardId, selectCard } = useUIStore.getState();
    if (!selectedCardId) return;

    const state = gameQuery.state();
    const player = state.playerStates[state.activePlayerId];

    // カード定義の特定
    const cardDef = cardMasterData.find(c => selectedCardId.startsWith(c.id));
    if (!cardDef) return;

    // 履歴の追加
    gameActions.history.add(PLAY_CARD_ACTION_TYPE, {
      cardId: selectedCardId,
      x: targetCell.x,
      y: targetCell.y
    });

    state.internal_mutate((draft) => {
      if (cardDef.cardType === "alien") {
        // 外来種配置
        const newId = generateId("alien");
        draft.activeAlienInstances[newId] = {
          instanceId: newId,
          cardDefinitionId: cardDef.id,
          currentX: targetCell.x,
          currentY: targetCell.y,
          spawnedTurn: draft.currentTurn
        };
        draft.gameField.cells[targetCell.y][targetCell.x] = FieldSystem.createAlienCoreCell(targetCell.x, targetCell.y, newId);
      }
      else if (cardDef.cardType === "eradication" || cardDef.cardType === "recovery") {
        // 駆除・回復の範囲計算
        const impact = EffectSystem.getEffectRange(cardDef, targetCell, draft.gameField, player.facingFactor);

        impact.forEach(c => {
          const current = draft.gameField.cells[c.y][c.x];

          if (cardDef.cardType === "eradication") {
            if (current.cellType === "alien_invasion_area" || current.cellType === "alien_core") {
              if (current.cellType === "alien_core") delete draft.activeAlienInstances[current.alienInstanceId];
              draft.gameField.cells[c.y][c.x] = cardDef.postRemovalState === "recovery_pending_area"
                ? FieldSystem.createRecoveryPendingCell(c.x, c.y, draft.currentTurn)
                : FieldSystem.createEmptyCell(c.x, c.y);
            }
          } else if (cardDef.cardType === "recovery") {
            if (current.cellType === "empty_area" || current.cellType === "recovery_pending_area") {
              draft.gameField.cells[c.y][c.x] = cardDef.postRecoveryState === "native_area"
                ? FieldSystem.createNativeCell(c.x, c.y)
                : FieldSystem.createRecoveryPendingCell(c.x, c.y, draft.currentTurn);
            }
          }
        });
      }

      // コスト消費
      draft.playerStates[draft.activePlayerId].currentEnvironment -= cardDef.cost;
    });

    selectCard(null);
  };

  gameEventBus.on("CELL_CLICK", handler);

  // App.tsx の useEffect cleanup で使用するために解除関数を返す
  return () => gameEventBus.off("CELL_CLICK", handler);
};