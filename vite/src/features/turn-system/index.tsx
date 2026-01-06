// vite/src/features/turn-system/index.tsx
import React from "react";
import { GameFeature } from "@/core/types/architecture";
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { useGameStore } from "@/core/store/gameStore";
import TurnEndButton from "./ui/TurnEndButton";

export const turnSystemFeature: GameFeature = {
  key: "turn-system",

  init: () => {
    // ラウンド開始時のサマリーログ
    const handleRoundStart = ({ round }: { round: number }) => {
      const state = useGameStore.getState();
      console.group(`🔔 === ROUND ${round} START ===`);
      console.info(`Phase: ${state.currentPhase}`);
      console.info(
        `Score - Alien: ${state.alienScore}, Native: ${state.nativeScore}`,
      );
      console.info(`Active Player: ${state.activePlayerId}`);
      console.groupEnd();
    };

    // ラウンド終了時のサマリーログ
    const handleRoundEnd = ({ round }: { round: number }) => {
      console.log(
        `[System] Round ${round} Ending... (Entering passive phases)`,
      );
    };

    gameEventBus.on("ROUND_START", handleRoundStart);
    gameEventBus.on("ROUND_END", handleRoundEnd);

    return () => {
      gameEventBus.off("ROUND_START", handleRoundStart);
      gameEventBus.off("ROUND_END", handleRoundEnd);
    };
  },

  renderUI: (slot) => {
    if (slot === "ui-overlay") {
      return <TurnEndButton />;
    }
    return null;
  },
};
