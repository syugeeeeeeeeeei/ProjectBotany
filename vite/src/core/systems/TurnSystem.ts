import { useGameStore } from "@/core/store/gameStore";
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { PlayerType } from "@/shared/types/primitives";

export class TurnSystem {
  /**
   * ターンを進める（ターン終了ボタン押下時など）
   */
  static async advanceTurn() {
    const store = useGameStore.getState();

    // 1. ターン終了前イベント (割り込み処理: 浸食やダメージ計算など)
    // FeatureはこのイベントをListenして、自身のロジックを実行する
    gameEventBus.emit("BEFORE_TURN_END", store);

    // ※ 本来はここでPromise.allなどでFeatureの処理完了を待つ仕組みが必要だが
    // Phase 2時点では同期的に実行されるものとして進める

    store.internal_mutate((draft) => {
      // 2. プレイヤー交代処理
      const currentPlayerId = draft.activePlayerId;

      // Native終了時にターン数加算
      if (currentPlayerId === "native") {
        draft.currentTurn += 1;
      }

      // 交代
      const nextPlayerId: PlayerType =
        currentPlayerId === "alien" ? "native" : "alien";
      draft.activePlayerId = nextPlayerId;

      // リソース回復
      const nextPlayer = draft.playerStates[nextPlayerId];
      if (nextPlayer.maxEnvironment < 10) {
        nextPlayer.maxEnvironment += 1;
      }
      nextPlayer.currentEnvironment = nextPlayer.maxEnvironment;

      // クールダウン減少
      nextPlayer.cooldownActiveCards = nextPlayer.cooldownActiveCards
        .map((c) => ({ ...c, turnsRemaining: c.turnsRemaining - 1 }))
        .filter((c) => c.turnsRemaining > 0);

      draft.currentPhase = "summon_phase";

      // 3. スコア集計
      let nativeCount = 0;
      let alienCount = 0;
      draft.gameField.cells.flat().forEach((cell) => {
        if (cell.cellType === "native_area") nativeCount++;
        else if (
          cell.cellType === "alien_core" ||
          cell.cellType === "alien_invasion_area"
        )
          alienCount++;
      });
      draft.nativeScore = nativeCount;
      draft.alienScore = alienCount;

      // 終了判定
      if (draft.currentTurn > draft.maximumTurns) {
        draft.isGameOver = true;
        if (nativeCount > alienCount) draft.winningPlayerId = "native";
        else if (alienCount > nativeCount) draft.winningPlayerId = "alien";
        else draft.winningPlayerId = null;

        gameEventBus.emit("GAME_OVER", { winner: draft.winningPlayerId });
      }
    });

    // 4. ターン開始イベント
    gameEventBus.emit("TURN_START", useGameStore.getState());
  }
}
