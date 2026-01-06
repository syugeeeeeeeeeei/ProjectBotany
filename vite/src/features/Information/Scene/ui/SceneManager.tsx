import React from "react";
import { useGameQuery, gameActions } from "@/core/api";
import { TitleScreen } from "./TitleScreen";
import { GameOverDialog } from "./GameOverScreen";

export const SceneManager: React.FC = () => {
  const { isGameOver } = useGameQuery.useGameState();
  //   const currentRound = useGameQuery.useCurrentRound();
  // ゲーム開始フラグは簡易的にRound数やPhaseで判定するか、別途フラグを持つべきですが、
  // ここではRound 0 = 未開始 と仮定するか、既存のロジックに合わせます。
  // 元のUIOverlayでは hasStarted State をローカルで持っていました。
  // ここでも簡易的な状態管理を行うか、GameStoreに `isGameStarted` があればそれを使います。
  // 今回は元のロジックを尊重し、Round 1未満ならタイトル、と判断します（要件に応じて調整）。

  // しかし、元のUIOverlayでは `useState` で `hasStarted` を管理していました。
  // Feature内コンポーネントで同様に管理します。
  const [hasStarted, setHasStarted] = React.useState(false);

  const handleStart = () => {
    setHasStarted(true);
    // 初回ラウンド開始トリガーなどはここで行うか、TitleScreenのonStartで行う
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
