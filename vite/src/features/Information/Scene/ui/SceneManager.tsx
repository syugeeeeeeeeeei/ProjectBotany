import React from "react";
import { useGameQuery, gameActions } from "@/core/api";
import { gameEventBus } from "@/core/event-bus/GameEventBus"; // ✨ 追加
import { TitleScreen } from "./TitleScreen";
import { GameOverDialog } from "./GameOverScreen";

export const SceneManager: React.FC = () => {
  const { isGameOver } = useGameQuery.useGameState();

  // 元のUIOverlayでは hasStarted State をローカルで持っていました。
  const [hasStarted, setHasStarted] = React.useState(false);

  const handleStart = () => {
    setHasStarted(true);
    // ✨ 修正: ゲーム開始時に明示的にROUND_STARTイベントを発行
    // これにより BannerManager が反応し、Round 1 のバナーを表示します
    gameEventBus.emit("ROUND_START", { round: 1 });
  };

  const handleRestart = () => {
    gameActions.system.reset();
    setHasStarted(false);
  };

  // タイトル画面
  if (!hasStarted) {
    return (
      <>
        <TitleScreen side="top" onStart={handleStart} />
        <TitleScreen side="bottom" onStart={handleStart} />
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
          onRestart={handleRestart}
        />
        <GameOverDialog
          side="bottom"
          playerId="alien"
          onRestart={handleRestart}
        />
      </>
    );
  }

  return null;
};
