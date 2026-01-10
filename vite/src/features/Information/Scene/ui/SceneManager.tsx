import React, { useState } from "react";
import { useGameQuery, gameActions } from "@/core/api";
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { TitleScreen } from "./TitleScreen";
import { GameOverDialog } from "./GameOverScreen";
import { useUIStore } from "@/core/store/uiStore"; // ✨ 追加

export const SceneManager: React.FC = () => {
  const { isGameOver } = useGameQuery.useGameState();
  const resetUI = useUIStore((state) => state.reset); // ✨ 追加

  // ゲーム進行管理フラグ
  const [hasStarted, setHasStarted] = useState(false);

  // ✨ 追加: 両プレイヤーの準備状態管理
  // native = Top side, alien = Bottom side (GameStoreのfacingFactorとUI配置に基づく)
  const [readyStates, setReadyStates] = useState<{
    native: boolean;
    alien: boolean;
  }>({
    native: false,
    alien: false,
  });

  // 準備完了ハンドラ (タイトル画面用)
  const handleReadyToStart = (player: "native" | "alien") => {
    setReadyStates((prev) => {
      const next = { ...prev, [player]: true };

      // 両方準備完了したらゲーム開始
      if (next.native && next.alien) {
        // 少し遅延させて開始感を出す（オプション）
        setTimeout(() => {
          startGame();
        }, 500);
      }
      return next;
    });
  };

  const startGame = () => {
    setHasStarted(true);
    // 準備状態をリセット
    setReadyStates({ native: false, alien: false });

    // ゲーム開始イベント発行 (Round 1 Banner等)
    gameEventBus.emit("ROUND_START", { round: 1 });
  };

  // リスタート準備ハンドラ (ゲームオーバー画面用)
  const handleReadyToRestart = (player: "native" | "alien") => {
    setReadyStates((prev) => {
      const next = { ...prev, [player]: true };

      // 両方準備完了したらタイトルに戻る
      if (next.native && next.alien) {
        setTimeout(() => {
          backToTitle();
        }, 500);
      }
      return next;
    });
  };

  const backToTitle = () => {
    // ✨ 修正: ゲームロジックとUIステートを両方リセット
    gameActions.system.reset();
    resetUI();

    setHasStarted(false);
    setReadyStates({ native: false, alien: false });
  };

  // タイトル画面
  if (!hasStarted) {
    return (
      <>
        <TitleScreen
          side="top"
          onStart={() => handleReadyToStart("native")}
          isReady={readyStates.native}
        />
        <TitleScreen
          side="bottom"
          onStart={() => handleReadyToStart("alien")}
          isReady={readyStates.alien}
        />
      </>
    );
  }

  // ゲームオーバー画面
  if (isGameOver) {
    return (
      <>
        <GameOverDialog
          side="top"
          playerId="native"
          onRestart={() => handleReadyToRestart("native")}
          isReady={readyStates.native}
        />
        <GameOverDialog
          side="bottom"
          playerId="alien"
          onRestart={() => handleReadyToRestart("alien")}
          isReady={readyStates.alien}
        />
      </>
    );
  }

  return null;
};
