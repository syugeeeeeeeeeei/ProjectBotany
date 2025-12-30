import React, { useEffect } from "react";
import { GameLayout } from "@/core/ui/GameLayout";
import { initializeGameComposition } from "./GameComposition";
import { GameBoard3D } from "@/features/field-grid";
import { TurnEndButton } from "@/features/turn-system";
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

    // アンマウント時、または Strict Mode の再実行時にイベント購読を解除
    return () => {
      cleanupPlayCard();
      cleanupAlienExpansion();
    };
  }, []);

  return (
    <GameLayout
      uiOverlay={
        <>
          <div
            style={{ padding: "20px", color: "white", pointerEvents: "none" }}
          >
            <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Project Botany v2</h1>
            <p style={{ margin: "5px 0", fontSize: "0.8rem", opacity: 0.7 }}>
              Phase 4: Logic Implementation & Event Cleanup
            </p>
          </div>
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
