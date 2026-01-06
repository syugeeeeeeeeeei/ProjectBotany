// vite/src/features/alien-expansion/index.ts
import { GameFeature } from "@/core/types/architecture";
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { useGameStore } from "@/core/store/gameStore";
import { gameActions } from "@/core/api/actions";
import { processAlienExpansion } from "./logic";

export const alienExpansionFeature: GameFeature = {
  key: "alien-expansion",

  init: () => {
    // ROUND_END (在来種ターンが終わり、次のラウンドへ行く前) に拡散を実行
    const handleRoundEnd = () => {
      const currentState = useGameStore.getState();
      const nextState = processAlienExpansion(currentState);

      if (nextState !== currentState) {
        gameActions.system.updateState(nextState);
      }
    };

    gameEventBus.on("ROUND_END", handleRoundEnd);
    return () => gameEventBus.off("ROUND_END", handleRoundEnd);
  },

  renderUI: () => null,
};