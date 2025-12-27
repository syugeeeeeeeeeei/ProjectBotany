import React from "react";
import styled from "styled-components";
import { useUIStore } from "@/app/store/useUIStore";
import { useGameStore } from "@/app/store/useGameStore";
import { BaseActionButton } from "@/shared/components/BaseActionButton";
import { PlayerType } from "@/shared/types/game-schema";

const StyledTurnEndButton = styled(BaseActionButton)`
  background: linear-gradient(145deg, #81c784, #4caf50);
`;

interface TurnEndButtonProps {
  player: PlayerType;
}

const TurnEndButton: React.FC<TurnEndButtonProps> = ({ player }) => {
  const { progressTurn, isGameOver, activePlayerId } = useGameStore();
  const { deselectCard } = useUIStore();

  const handleTurnEnd = () => {
    deselectCard();
    progressTurn();
  };

  const isDisabled = isGameOver || activePlayerId !== player;

  return (
    <StyledTurnEndButton onClick={handleTurnEnd} disabled={isDisabled}>
      ターン終了
    </StyledTurnEndButton>
  );
};

export default TurnEndButton;
