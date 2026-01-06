import React from "react";
import styled, { keyframes } from "styled-components";
import { useGameQuery } from "@/core/api";
import { BaseActionButton } from "@/shared/components/BaseActionButton";
import { PlayerType } from "@/shared/types";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Container = styled.div<{ $side: "top" | "bottom"; $resultColor: string }>`
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  z-index: 200;
  pointer-events: auto;
  border-top: 4px solid ${({ $resultColor }) => $resultColor};
  animation: ${fadeIn} 0.5s ease-out forwards;

  ${({ $side }) =>
    $side === "top" ? "top: 0; transform: rotate(180deg);" : "bottom: 0;"}
`;

const ResultTitle = styled.h1<{ $color: string }>`
  font-size: 3rem;
  color: ${({ $color }) => $color};
  margin-bottom: 10px;
  text-shadow: 0 0 15px ${({ $color }) => $color}80;
`;

const ScoreBoard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  min-width: 200px;
`;

const ScoreRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;

  &.total {
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    margin-top: 5px;
    padding-top: 5px;
    font-weight: bold;
  }
`;

interface GameOverDialogProps {
  side: "top" | "bottom";
  playerId: PlayerType;
  onRestart: () => void;
}

export const GameOverDialog: React.FC<GameOverDialogProps> = ({
  side,
  playerId,
  onRestart,
}) => {
  const { winningPlayerId, alienScore, nativeScore } =
    useGameQuery.useGameState();

  // プレイヤー視点での勝敗判定
  const isWin = winningPlayerId === playerId;
  const isDraw = winningPlayerId === null;

  const titleText = isWin ? "YOU WIN!" : isDraw ? "DRAW" : "YOU LOSE...";
  const resultColor = isWin ? "#4CAF50" : isDraw ? "#FFC107" : "#F44336";

  return (
    <Container $side={side} $resultColor={resultColor}>
      <ResultTitle $color={resultColor}>{titleText}</ResultTitle>

      <ScoreBoard>
        <ScoreRow>
          <span style={{ color: "#E91E63" }}>Alien</span>
          <span>{alienScore}</span>
        </ScoreRow>
        <ScoreRow>
          <span style={{ color: "#4CAF50" }}>Native</span>
          <span>{nativeScore}</span>
        </ScoreRow>
      </ScoreBoard>

      <BaseActionButton onClick={onRestart}>PLAY AGAIN</BaseActionButton>
    </Container>
  );
};
