// src/core/systems/RoundSystem.ts
import { GameState, CellState } from "@/shared/types";
import { FieldSystem } from "./FieldSystem";
import { gameEventBus } from "../event-bus/GameEventBus";
import { useGameStore } from "../store/gameStore";

export const RoundSystem = {
  /**
   * ラウンド開始処理: APの回復や植生遷移を行う
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

    // 植生遷移: 先駆植生(pioneer) -> 在来種(native)
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
      activePlayerId: "alien", // 新しいラウンドは外来種から
      playerStates: newPlayerStates,
      gameField: newField,
    };
  },

  /**
   * ラウンド終了時の処理を実行し、自動的に次のラウンドを開始する
   */
  endRoundProcess(gameState: GameState): void {
    console.log(`🏁 Ending Round ${gameState.currentRound}...`);

    // 1. ラウンド終了イベント発行（Featureが拡散・成長を実行する）
    gameEventBus.emit("ROUND_END", { round: gameState.currentRound });

    // 2. 次のラウンドへ自動遷移
    // 拡散処理などが同期的に終わる前提で、次のラウンドのステートを計算
    const nextRoundState = this.startRound(gameState);

    // 3. ストアを更新
    useGameStore.getState().setState(nextRoundState);
    console.log(`⏭️ Transitioned to Round ${nextRoundState.currentRound}`);
  },
};