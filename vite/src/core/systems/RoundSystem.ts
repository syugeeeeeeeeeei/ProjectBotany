// vite/src/core/systems/RoundSystem.ts
import { GameState, CellState } from "@/shared/types"; // indexから
import { FieldSystem } from "./FieldSystem";
import { gameEventBus } from "../event-bus/GameEventBus"; // 修正: インスタンスをインポート

export const RoundSystem = {
  startRound(gameState: GameState): GameState {
    const { currentRound, playerStates, gameField } = gameState;
    const nextRound = currentRound + 1;

    const newPlayerStates = { ...playerStates };
    Object.keys(newPlayerStates).forEach((key) => {
      const playerId = key as keyof typeof playerStates;
      const player = newPlayerStates[playerId];
      const newMaxAp = Math.min(nextRound, gameState.maximumRounds);

      newPlayerStates[playerId] = {
        ...player,
        maxEnvironment: newMaxAp,
        currentEnvironment: newMaxAp,
      };
    });

    const newCells: CellState[] = [];
    for (let y = 0; y < gameField.height; y++) {
      for (let x = 0; x < gameField.width; x++) {
        const cell = gameField.cells[y][x];
        if (cell.type === "pioneer") {
          newCells.push({
            ...cell,
            type: "native",
            ownerId: "native",
          });
        }
      }
    }

    const newField = FieldSystem.updateCells(gameField, newCells);

    // 修正: gameEventBus (instance) を使用
    gameEventBus.emit("ROUND_START", { round: nextRound });

    return {
      ...gameState,
      currentRound: nextRound,
      currentPhase: "start",
      playerStates: newPlayerStates,
      gameField: newField,
    };
  },

  endRoundProcess(gameState: GameState): void {
    // 修正: gameEventBus (instance) を使用
    gameEventBus.emit("ROUND_END", { round: gameState.currentRound });
  },
};