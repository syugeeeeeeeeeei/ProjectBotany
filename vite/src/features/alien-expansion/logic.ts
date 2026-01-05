// vite/src/features/alien-expansion/logic.ts
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { gameQuery } from "@/core/api";
import { FieldSystem } from "@/core/systems/FieldSystem";
import { EffectSystem } from "@/core/systems/EffectSystem";
import cardMasterData from "@/shared/data/cardMasterData";

export const initAlienExpansionLogic = () => {
  const handler = () => {
    const state = gameQuery.state();

    // ソート: コストが高い順 -> 生存期間が長い順
    const sortedAliens = Object.values(state.activeAlienInstances).sort(
      (a, b) => {
        const costA =
          cardMasterData.find((c) => c.id === a.cardDefinitionId)?.cost ?? 0;
        const costB =
          cardMasterData.find((c) => c.id === b.cardDefinitionId)?.cost ?? 0;
        if (costB !== costA) return costB - costA;
        return b.roundsSinceSpawn - a.roundsSinceSpawn;
      },
    );

    state.internal_mutate((draft) => {
      sortedAliens.forEach((alien) => {
        // 起点: 外来種トークンの現在位置
        const origin = { x: alien.currentX, y: alien.currentY };

        // 範囲計算: 現在のパラメータ(成長後)を使用
        const targets = EffectSystem.calculateShapeArea(
          origin,
          alien.currentInvasionShape,
          alien.currentInvasionPower,
          draft.gameField,
          undefined,
          1 // Alien direction
        );

        targets.forEach((t) => {
          const cell = draft.gameField.cells[t.y][t.x];

          if (
            cell.cellType === "bare_ground_area" ||
            cell.cellType === "pioneer_vegetation_area" ||
            cell.cellType === "native_area"
          ) {
            draft.gameField.cells[t.y][t.x] = FieldSystem.createAlienCell(
              t.x,
              t.y,
              alien.instanceId
            );
          }
        });
      });
    });
  };

  // イベント購読
  gameEventBus.on("BEFORE_ROUND_END", handler);

  // クリーンアップ関数を返す (App.tsxでのエラー回避のため必須)
  return () => gameEventBus.off("BEFORE_ROUND_END", handler);
};