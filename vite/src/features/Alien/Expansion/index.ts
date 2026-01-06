// vite/src/features/alien-expansion/index.tsx
import { GameFeature } from "@/core/types/architecture";
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { useGameStore } from "@/core/store/gameStore";
import { gameActions } from "@/core/api/actions";
import { processAlienExpansion } from "./logic";

export const alienExpansionFeature: GameFeature = {
  key: "alien-expansion",

  init: () => {
    const handleRoundEnd = () => {
      console.log("🌊 [Feature: Alien Expansion] Processing...");
      const currentState = useGameStore.getState();
      const nextState = processAlienExpansion(currentState);
      if (nextState !== currentState) {
        gameActions.system.updateState(nextState);
      }
    };

    gameEventBus.on("ROUND_END", handleRoundEnd);

    return () => {
      gameEventBus.off("ROUND_END", handleRoundEnd);
    };
  },

  // UIを持たないFeatureは常にnullを返す
  renderUI: () => null,
};
