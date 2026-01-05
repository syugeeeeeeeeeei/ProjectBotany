import React from "react";
import { useGameQuery, gameActions } from "@/core/api";
import { BaseActionButton } from "@/shared/components/BaseActionButton";

export const GameOverDialog: React.FC = () => {
  const { isGameOver, winningPlayerId, alienScore, nativeScore } =
    useGameQuery.useGameState();

  if (!isGameOver) return null;

  const handleReset = () => {
    gameActions.system.reset();
  };

  const winMessage =
    winningPlayerId === "alien"
      ? "ALIEN WINS!"
      : winningPlayerId === "native"
        ? "NATIVE WINS!"
        : "DRAW GAME";

  const resultColor = winningPlayerId === "alien" ? "#C62828" : "#2E7D32";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "4rem",
          color: resultColor,
          marginBottom: "20px",
          textShadow: "0 0 10px white",
        }}
      >
        {winMessage}
      </h1>

      <div
        style={{
          fontSize: "1.5rem",
          marginBottom: "40px",
          textAlign: "center",
        }}
      >
        <p>Alien Score: {alienScore}</p>
        <p>Native Score: {nativeScore}</p>
      </div>

      <BaseActionButton
        onClick={handleReset}
        style={{
          padding: "15px 40px",
          fontSize: "1.5rem",
          backgroundColor: "white",
          color: "black",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        PLAY AGAIN
      </BaseActionButton>
    </div>
  );
};
