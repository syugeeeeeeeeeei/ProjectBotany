import React from "react";
import { GameInfo } from "./GameInfo";
import { GameOverDialog } from "./GameOverDialog";

export const UIOverlay: React.FC = () => {
  return (
    <div style={{ pointerEvents: "none", width: "100%", height: "100%" }}>
      {/* 常時表示のゲーム情報 */}
      <GameInfo />

      {/* ゲーム終了時のみ表示されるダイアログ (pointerEvents有効化) */}
      <div style={{ pointerEvents: "auto" }}>
        <GameOverDialog />
      </div>
    </div>
  );
};
