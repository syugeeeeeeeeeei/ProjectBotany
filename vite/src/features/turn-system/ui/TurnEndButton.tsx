// vite/src/features/turn-system/ui/TurnEndButton.tsx
import React from "react";
import { gameActions, useGameQuery } from "@/core/api";
import { BaseActionButton } from "@/shared/components/BaseActionButton";

const TurnEndButton: React.FC = () => {
  const activePlayer = useGameQuery.useActivePlayer();
  const currentRound = useGameQuery.useCurrentRound();

  const handleClick = () => {
    console.log("🔄 Turn End Requested");
    // 修正: round.end ではなく turn.end を呼ぶ
    gameActions.turn.end();
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        pointerEvents: "auto",
      }}
    >
      <BaseActionButton
        onClick={handleClick}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          fontWeight: "bold",
          backgroundColor: activePlayer === "native" ? "#2E7D32" : "#C62828",
          color: "white",
          border: "2px solid white",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        }}
      >
        Turn End (Round {currentRound})
      </BaseActionButton>
      <div
        style={{
          marginTop: "5px",
          textAlign: "right",
          color: "white",
          fontSize: "12px",
          textShadow: "1px 1px 0 #000",
        }}
      >
        Current: {activePlayer.toUpperCase()}
      </div>
    </div>
  );
};

export default TurnEndButton;
