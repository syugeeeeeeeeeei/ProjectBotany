import React, { useEffect } from "react";
import { GameLayout } from "@/core/ui/GameLayout";
import { initializeGameComposition } from "./GameComposition";
import { GameBoard3D } from "@/features/field-grid";
import { TurnEndButton } from "@/features/turn-system"; // 使用されていることを確認
import { Hand3D } from "@/features/card-hand";
import { initPlayCardLogic } from "@/features/play-card";
import { initAlienExpansionLogic } from "@/features/alien-expansion";

const App: React.FC = () => {
  useEffect(() => {
    // 1. Core 初期化
    initializeGameComposition();

    // 2. Logic 初期化とクリーンアップの登録
    const cleanupPlayCard = initPlayCardLogic();
    const cleanupAlienExpansion = initAlienExpansionLogic();

    return () => {
      cleanupPlayCard();
      cleanupAlienExpansion();
    };
  }, []);

  return (
    <GameLayout
      uiOverlay={
        <>
          <TurnEndButton />
        </>
      }
    >
      <GameBoard3D />
      <Hand3D player="alien" />
      <Hand3D player="native" />
    </GameLayout>
  );
};

export default App;
