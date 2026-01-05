// vite/src/core/systems/RoundSystem.ts

import { GameState, CellState } from "@/shared/types";
import { processAlienGrowth } from "@/features/alien-growth/logic";
import { processAlienExpansion } from "@/features/alien-expansion/logic";
import { FieldSystem } from "./FieldSystem";

export const RoundSystem = {
  /**
   * ラウンド開始時の処理
   * 1. エンバイロメント(AP)の最大値増加と回復
   * 2. 植生遷移: 「先駆植生」を「在来種」へ自動回復
   */
  startRound(gameState: GameState): GameState {
    const { currentRound, playerStates, gameField } = gameState;

    // 1. AP回復処理
    // 次のラウンドへ (最大ラウンドを超えないように制御は別途必要だが、ここでは加算)
    const nextRound = currentRound + 1;

    // 各プレイヤーのAPをリセット・増加
    const newPlayerStates = { ...playerStates };
    Object.keys(newPlayerStates).forEach((key) => {
      const playerId = key as keyof typeof playerStates;
      const player = newPlayerStates[playerId];

      // 最大APはラウンド数に比例 (例: R1=1, R2=2...)
      // 必要に応じて上限キャップ(maxRounds)を設ける
      const newMaxAp = Math.min(nextRound, gameState.maximumRounds); // ゲームバランスにより調整

      newPlayerStates[playerId] = {
        ...player,
        maxEnvironment: newMaxAp,
        currentEnvironment: newMaxAp,
      };
    });

    // 2. 植生遷移 (Succession)
    // 先駆植生マス(pioneer)を全て在来種マス(native)に変化させる
    // 先駆植生は「1ラウンドだけ外来種を防ぐバリア」として機能する仕様
    const newCells: CellState[] = [];

    // フィールド全体をスキャン
    for (let y = 0; y < gameField.height; y++) {
      for (let x = 0; x < gameField.width; x++) {
        const cell = gameField.cells[y][x];
        if (cell.type === "pioneer") {
          newCells.push({
            ...cell,
            type: "native",
            // 先駆植生は中立だったが、在来種マスは在来種プレイヤーの支配下となる
            ownerId: "native",
          });
        }
      }
    }

    // セルの更新を適用
    const newField = FieldSystem.updateCells(gameField, newCells);

    return {
      ...gameState,
      currentRound: nextRound,
      currentPhase: "start", // UI側でアニメーション後に alien_turn へ移行させる
      playerStates: newPlayerStates,
      gameField: newField,
    };
  },

  /**
   * ラウンド終了時の処理
   * 1. 拡散 (Expansion) - ※別ステップ(Step 5)で実装、ここではプレースホルダー
   * 2. 成長 (Growth) - 種から成体へ
   */
  endRound(gameState: GameState): GameState {
    let newState = { ...gameState };

    // TODO: Step 5で拡散処理(processAlienExpansion)をここに組み込む
    newState = processAlienExpansion(newState);

    // 成長処理 (種 -> 成体)
    newState = processAlienGrowth(newState);

    return {
      ...newState,
      currentPhase: "end", // UI側で演出後に startRound を呼ぶフローへ
    };
  },
};