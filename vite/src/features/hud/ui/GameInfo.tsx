import React from "react";
import { useGameQuery } from "@/core/api";

export const GameInfo: React.FC = () => {
  const currentRound = useGameQuery.useCurrentRound();
  const { maximumRounds, alienScore, nativeScore } =
    useGameQuery.useGameState();

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        color: "white",
        textShadow: "1px 1px 2px black",
        fontFamily: "monospace",
        fontSize: "16px",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <div style={{ fontSize: "24px", fontWeight: "bold" }}>
        ROUND: {currentRound} / {maximumRounds}
      </div>
      <div style={{ marginTop: "10px" }}>
        <span style={{ color: "#EF5350" }}>Alien: {alienScore}</span>
        <span style={{ margin: "0 10px" }}>vs</span>
        <span style={{ color: "#66BB6A" }}>Native: {nativeScore}</span>
      </div>
    </div>
  );
};
