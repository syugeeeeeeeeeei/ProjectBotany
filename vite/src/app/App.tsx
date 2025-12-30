import React, { useEffect } from "react";
import { GameLayout } from "@/core/ui/GameLayout";
import { initializeGameComposition } from "./GameComposition";

const App: React.FC = () => {
  // マウント時に一度だけ初期化を実行
  useEffect(() => {
    initializeGameComposition();
  }, []);

  return (
    <GameLayout
      uiOverlay={
        <div style={{ padding: "20px", color: "white", pointerEvents: "auto" }}>
          <h1>Project Botany v2</h1>
          <p>Phase 3: Core Wiring Complete.</p>
          <p style={{ fontSize: "0.8rem", color: "#aaa" }}>
            Waiting for Features (Board, Cards...) to be injected.
          </p>
        </div>
      }
    >
      {/* ここに将来 GameBoard3D などが入る */}
      {/* <GameBoard3D /> */}
    </GameLayout>
  );
};

export default App;
