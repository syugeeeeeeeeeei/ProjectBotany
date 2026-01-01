import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { gameQuery } from "@/core/api";
import { FieldSystem } from "@/core/systems/FieldSystem";
import { EffectSystem } from "@/core/systems/EffectSystem";
import cardMasterData from "@/shared/data/cardMasterData";

/**
 * initAlienExpansionLogic: 自動侵食ロジックの初期化
 * @returns クリーンアップ関数（イベント購読の解除）
 */
export const initAlienExpansionLogic = () => {
  const handler = () => {
    const state = gameQuery.state();
    if (state.activePlayerId !== "alien") return;

    // 優先順位に基づいたソート
    const sortedAliens = Object.values(state.activeAlienInstances).sort(
      (a, b) => {
        const costA =
          cardMasterData.find((c) => c.id === a.cardDefinitionId)?.cost ?? 0;
        const costB =
          cardMasterData.find((c) => c.id === b.cardDefinitionId)?.cost ?? 0;
        return costB !== costA ? costB - costA : b.spawnedTurn - a.spawnedTurn;
      },
    );

    state.internal_mutate((draft) => {
      sortedAliens.forEach((alien) => {
        const cardDef = cardMasterData.find(
          (c) => c.id === alien.cardDefinitionId,
        );
        if (!cardDef) return;

        // 支配マスの特定
        const owned = draft.gameField.cells
          .flat()
          .filter(
            (c) =>
              (c.cellType === "alien_core" &&
                c.alienInstanceId === alien.instanceId) ||
              (c.cellType === "alien_invasion_area" &&
                c.dominantAlienInstanceId === alien.instanceId),
          );

        owned.forEach((source) => {
          const targets = EffectSystem.getEffectRange(
            cardDef,
            source,
            draft.gameField,
            1,
          );
          targets.forEach((t) => {
            const cell = draft.gameField.cells[t.y][t.x];
            if (
              cell.cellType === "native_area" ||
              cell.cellType === "empty_area"
            ) {
              draft.gameField.cells[t.y][t.x] =
                FieldSystem.createAlienInvasionCell(t.x, t.y, alien.instanceId);
            }
          });
        });
      });
    });
  };

  gameEventBus.on("BEFORE_TURN_END", handler);

  // クリーンアップ関数を返す
  return () => gameEventBus.off("BEFORE_TURN_END", handler);
};
