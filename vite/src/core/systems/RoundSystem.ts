// vite/src/core/systems/RoundSystem.ts
import { useGameStore } from "@/core/store/gameStore";
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { FieldSystem } from "@/core/systems/FieldSystem";

export class RoundSystem {
  /**
   * ゲームを開始する（初期化直後）
   */
  static startGame() {
    this.startRound();
  }

  /**
   * 1. ラウンド開始フェーズ
   */
  static startRound() {
    const store = useGameStore.getState();

    store.internal_mutate((draft) => {
      draft.currentPhase = "round_start";

      // 型定義修正済みのため as any は不要
      gameEventBus.emit("ROUND_START", draft);

      // 1. 先駆植生マス(Pioneer) -> 在来種マス(Native) への自動回復
      const { width, height } = draft.gameField;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const cell = draft.gameField.cells[y][x];
          if (cell.cellType === "pioneer_vegetation_area") {
            draft.gameField.cells[y][x] = FieldSystem.createNativeCell(x, y);
          }
        }
      }

      // 2. エンバイロメント回復
      Object.values(draft.playerStates).forEach((player) => {
        if (player.maxEnvironment < 10) {
          player.maxEnvironment += 1;
        }
        player.currentEnvironment = player.maxEnvironment;
      });
    });

    setTimeout(() => {
      this.startAlienTurn();
    }, 1000);
  }

  /**
   * 2. 外来種ターン開始
   */
  static startAlienTurn() {
    const store = useGameStore.getState();
    store.internal_mutate((draft) => {
      draft.currentPhase = "alien_turn";
      draft.activePlayerId = "alien";
    });
    gameEventBus.emit("TURN_START", { playerId: "alien" });
  }

  /**
   * 3. 在来種ターン開始
   */
  static startNativeTurn() {
    const store = useGameStore.getState();
    store.internal_mutate((draft) => {
      draft.currentPhase = "native_turn";
      draft.activePlayerId = "native";
    });
    gameEventBus.emit("TURN_START", { playerId: "native" });
  }

  /**
   * 現在のターンを終了して次へ進む
   */
  static endCurrentTurn() {
    const store = useGameStore.getState();
    const currentPhase = store.currentPhase;

    if (currentPhase === "alien_turn") {
      this.startNativeTurn();
    } else if (currentPhase === "native_turn") {
      this.endRound();
    }
  }

  /**
   * 4. ラウンド終了フェーズ
   */
  static endRound() {
    const store = useGameStore.getState();

    gameEventBus.emit("BEFORE_ROUND_END", store);

    store.internal_mutate((draft) => {
      draft.currentPhase = "round_end";

      // クールダウン消化
      Object.values(draft.playerStates).forEach((player) => {
        player.cooldownActiveCards = player.cooldownActiveCards
          .map((c) => ({ ...c, roundsRemaining: c.roundsRemaining - 1 }))
          .filter((c) => c.roundsRemaining > 0);
      });

      // スコア計算
      let nativeCount = 0;
      let alienCount = 0;
      draft.gameField.cells.flat().forEach((cell) => {
        if (cell.cellType === "native_area") nativeCount++;
        if (cell.cellType === "alien_area") alienCount++;
      });
      draft.nativeScore = nativeCount;
      draft.alienScore = alienCount;

      // 勝利判定
      if (nativeCount === 0) {
        draft.isGameOver = true;
        draft.winningPlayerId = "alien";
      }
      else if (draft.currentRound >= draft.maximumRounds) {
        draft.isGameOver = true;
        if (nativeCount > alienCount) draft.winningPlayerId = "native";
        else if (alienCount > nativeCount) draft.winningPlayerId = "alien";
        else draft.winningPlayerId = null;
      }
    });

    const newState = useGameStore.getState();
    if (newState.isGameOver) {
      gameEventBus.emit("GAME_OVER", { winner: newState.winningPlayerId });
    } else {
      store.internal_mutate((draft) => {
        draft.currentRound += 1;
      });
      this.startRound();
    }
  }
}