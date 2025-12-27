import { produce } from "immer";
import { GameState, PlayerType } from "@/shared/types/game-schema";
import { runAlienActivationPhase } from "@/features/ecosystem-activation/domain/alienExpansion";
import { runNativeActivationPhase } from "@/features/ecosystem-activation/domain/nativeRestoration";

/**
 * ターンを経過させるロジック。
 */
export const progressTurnLogic = (
  state: GameState,
  _payload?: any,
): GameState => {
  return produce(state, (draft) => {
    // --- 1. 活性フェーズの実行 ---
    runAlienActivationPhase(draft);
    runNativeActivationPhase(draft);

    // --- 2. ターン進行と交代 ---
    const currentPlayerId = draft.activePlayerId;
    if (currentPlayerId === "native") {
      draft.currentTurn += 1;
    }

    const nextPlayerId: PlayerType =
      currentPlayerId === "alien" ? "native" : "alien";
    draft.activePlayerId = nextPlayerId;

    const nextPlayer = draft.playerStates[nextPlayerId];
    if (nextPlayer.maxEnvironment < 10) {
      nextPlayer.maxEnvironment += 1;
    }
    nextPlayer.currentEnvironment = nextPlayer.maxEnvironment;

    nextPlayer.cooldownActiveCards = nextPlayer.cooldownActiveCards
      .map((c) => ({ ...c, turnsRemaining: c.turnsRemaining - 1 }))
      .filter((c) => c.turnsRemaining > 0);

    draft.currentPhase = "summon_phase";

    // --- 3. スコア更新と勝敗判定 ---
    // ターン終了の有無に関わらず、常に最新のスコアを計算して保持するようにします
    let nativeCount = 0;
    let alienCount = 0;

    draft.gameField.cells.flat().forEach((cell) => {
      if (cell.cellType === "native_area") {
        nativeCount++;
      } else if (
        cell.cellType === "alien_core" ||
        cell.cellType === "alien_invasion_area"
      ) {
        alienCount++;
      }
    });

    draft.nativeScore = nativeCount;
    draft.alienScore = alienCount;

    // ゲーム終了判定
    if (draft.currentTurn > draft.maximumTurns) {
      draft.isGameOver = true;

      // 勝者の決定
      if (nativeCount > alienCount) {
        draft.winningPlayerId = "native";
      } else if (alienCount > nativeCount) {
        draft.winningPlayerId = "alien";
      } else {
        draft.winningPlayerId = null; // 引き分け
      }
    }
  });
};
