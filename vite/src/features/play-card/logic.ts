// vite/src/features/play-card/logic.ts
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { gameQuery } from "@/core/api";
import { FieldSystem } from "@/core/systems/FieldSystem";
import cardMasterData from "@/shared/data/cardMasterData";
import { AlienCard } from "@/shared/types/game-schema";
import { generateId } from "@/shared/utils/id";
import { CoreEventMap } from "@/core/types/events";

export const initPlayCardLogic = () => {
  const handler = (payload: CoreEventMap["PLAY_CARD"]) => {
    const { cardId, targetX, targetY } = payload;
    const store = gameQuery.state();
    const cardDef = cardMasterData.find((c) => c.id === cardId);

    if (!cardDef) return;

    store.internal_mutate((draft) => {
      // ... (中略: ロジック部分はそのまま) ...

      if (cardDef.cardType === "alien") {
        // ... (Alien Logic)
        const alienCard = cardDef as AlienCard;
        const instanceId = `alien-${generateId()}`;
        const newInstance = {
          instanceId,
          cardDefinitionId: cardId,
          spawnedRound: draft.currentRound,
          currentX: targetX,
          currentY: targetY,
          currentInvasionPower: alienCard.targeting.power,
          currentInvasionShape: alienCard.targeting.shape,
          currentGrowthStage: 0,
          roundsSinceSpawn: 0,
        };
        draft.activeAlienInstances[instanceId] = newInstance;
        draft.gameField.cells[targetY][targetX] = FieldSystem.createAlienCell(
          targetX,
          targetY,
          instanceId
        );
      }
      else if (cardDef.cardType === "eradication") {
        // ... (Eradication Logic)
        const cell = draft.gameField.cells[targetY][targetX];
        if (cell.cellType === "alien_area") {
          if (cell.dominantAlienInstanceId) {
            delete draft.activeAlienInstances[cell.dominantAlienInstanceId];
          }
          draft.gameField.cells[targetY][targetX] = FieldSystem.createBareGroundCell(targetX, targetY);
        }
      }
    });
  };

  // 1. イベント登録
  gameEventBus.on("PLAY_CARD", handler);

  // 2. クリーンアップ関数を返す (ここが重要！)
  return () => {
    gameEventBus.off("PLAY_CARD", handler);
  };
};