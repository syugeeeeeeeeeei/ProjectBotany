// src/core/systems/RoundSystem.ts
import { GameState, CellState, PlayerId } from "@/shared/types";
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

    // APのリセットと上限更新、およびクールダウンの更新
    const newPlayerStates = { ...playerStates };
    Object.keys(newPlayerStates).forEach((key) => {
      const playerId = key as keyof typeof playerStates;
      const player = newPlayerStates[playerId];
      const newMaxAp = Math.min(nextRound, gameState.maximumRounds);

      // ✨ 修正: クールダウンの更新処理を追加
      // 残りラウンド数を1減らし、0以下のものを除去する
      const updatedCooldowns = player.cooldownActiveCards
        .map((c) => ({ ...c, roundsRemaining: c.roundsRemaining - 1 }))
        .filter((c) => c.roundsRemaining > 0);

      newPlayerStates[playerId] = {
        ...player,
        maxEnvironment: newMaxAp,
        currentEnvironment: newMaxAp,
        cooldownActiveCards: updatedCooldowns, // 更新されたクールダウンリストを適用
      };
    });

    // 植生遷移: 先駆植生（薄緑）が在来種（緑）へ自動回復する
    const newCells: CellState[] = [];
    for (let y = 0; y < gameField.height; y++) {
      for (let x = 0; x < gameField.width; x++) {
        const cell = gameField.cells[y][x];
        if (cell.type === "pioneer") {
          // ✨ 修正: 生成された直後のラウンド開始時には回復しないようにする
          // pioneerCreatedAt は先駆植生が作られたラウンド (例: 1)
          // currentRound は終了したばかりのラウンド (例: 1)
          // この startRound が呼ばれるのは R1終了後の R2開始処理。
          // 1-n に作られた場合: pioneerCreatedAt = 1, currentRound = 1
          // 1 > 1 (False) となり回復しない。
          // R2終了後の R3開始処理: currentRound = 2
          // 2 > 1 (True) となり回復する。
          const createdAt = cell.pioneerCreatedAt ?? 0;
          if (currentRound > createdAt) {
            newCells.push({
              ...cell,
              type: "native",
              ownerId: "native",
              pioneerCreatedAt: undefined // 属性を消去
            });
          }
        }
      }
    }

    const newField = FieldSystem.updateCells(gameField, newCells);

    // 最新のフィールドからスコアを再計算
    const nativeScore = FieldSystem.countCellsByType(newField, "native");
    const alienScore = FieldSystem.countCellsByType(newField, "alien");

    // ROUND_STARTイベントを発行
    gameEventBus.emit("ROUND_START", { round: nextRound });

    return {
      ...gameState,
      currentRound: nextRound,
      currentPhase: "start",
      activePlayerId: "alien",
      playerStates: newPlayerStates,
      gameField: newField,
      nativeScore,
      alienScore,
    };
  },

  /**
   * ラウンド終了時の処理
   */
  endRoundProcess(gameState: GameState): void {
    console.log(`🏁 Ending Round ${gameState.currentRound}...`);

    // 1. ラウンド終了イベント発行
    // この中で Feature (Growth/Expansion) が自動処理を実行し、Store を更新する
    gameEventBus.emit("ROUND_END", { round: gameState.currentRound });

    // 2. 重要：Featureによって更新された「最新のステート」を取得し直す
    const latestState = useGameStore.getState();

    // 3. 終了判定: 現在のラウンドが最大ラウンドに達しているか
    if (latestState.currentRound >= latestState.maximumRounds) {
      console.log("🏆 Game Over: Maximum rounds reached.");

      // 最終的なスコアの集計（支配マス数比較）
      const finalNativeScore = FieldSystem.countCellsByType(latestState.gameField, "native");
      const finalAlienScore = FieldSystem.countCellsByType(latestState.gameField, "alien");

      // 勝者の決定
      let winner: PlayerId | null = null;
      if (finalNativeScore > finalAlienScore) {
        winner = "native";
      } else if (finalAlienScore > finalNativeScore) {
        winner = "alien";
      }

      // ゲーム終了状態へ遷移
      useGameStore.getState().setState({
        isGameOver: true,
        winningPlayerId: winner,
        nativeScore: finalNativeScore,
        alienScore: finalAlienScore,
        currentPhase: "end"
      });
      return;
    }

    // 4. 最大ラウンドに達していなければ、次のラウンドを開始
    const nextRoundState = RoundSystem.startRound(latestState);
    useGameStore.getState().setState(nextRoundState);
    console.log(`⏭️ Transitioned to Round ${nextRoundState.currentRound}`);
  },
};