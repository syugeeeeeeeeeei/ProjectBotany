// src/core/systems/RoundSystem.ts
import { GameState, CellState } from "@/shared/types";
import { FieldSystem } from "./FieldSystem";
import { gameEventBus } from "../event-bus/GameEventBus";
import { useGameStore } from "../store/gameStore";

export const RoundSystem = {
  /**
   * ラウンド開始処理
   */
  startRound(gameState: GameState): GameState {
    const { currentRound, playerStates, gameField } = gameState;
    const nextRound = currentRound + 1;

    // APのリセットと上限更新
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

    // 植生遷移
    const newCells: CellState[] = [];
    for (let y = 0; y < gameField.height; y++) {
      for (let x = 0; x < gameField.width; x++) {
        const cell = gameField.cells[y][x];
        if (cell.type === "pioneer") {
          newCells.push({ ...cell, type: "native", ownerId: "native" });
        }
      }
    }

    const newField = FieldSystem.updateCells(gameField, newCells);

    // ROUND_STARTイベントを発行
    gameEventBus.emit("ROUND_START", { round: nextRound });

    return {
      ...gameState,
      currentRound: nextRound,
      currentPhase: "start",
      activePlayerId: "alien",
      playerStates: newPlayerStates,
      gameField: newField,
    };
  },

  /**
   * ラウンド終了時の処理
   */
  endRoundProcess(gameState: GameState): void {
    console.log(`🏁 Ending Round ${gameState.currentRound}...`);

    // 1. ラウンド終了イベント発行
    // この中で Feature (Growth/Expansion) が Store を更新する
    gameEventBus.emit("ROUND_END", { round: gameState.currentRound });

    // 2. 重要：Featureによって更新された「最新のステート」を取得し直す
    const latestState = useGameStore.getState();

    // 3. 最新のステートを元に次のラウンドを計算
    const nextRoundState = this.startRound(latestState);

    // 4. ストアを更新
    useGameStore.getState().setState(nextRoundState);
    console.log(`⏭️ Transitioned to Round ${nextRoundState.currentRound}`);
  },
};