import React from "react";
import styled from "styled-components";
import { useGameStore } from "../../../app/store/useGameStore";
import type { PlayerType } from "../../../shared/types/game-schema";

const STYLES = {
  BACKGROUND_COLOR: "rgba(0, 0, 0, 0.7)",
  TEXT_COLOR: "white",
  SUB_TEXT_COLOR: "#aaa",
  PADDING: "10px 5px",
  BORDER_RADIUS: "8px",
  GAP: "10px",
  FONT_SIZE: "1.3em",
  SUB_FONT_SIZE: "0.8em",
};

const InfoContainer = styled.div`
  background-color: ${STYLES.BACKGROUND_COLOR};
  color: ${STYLES.TEXT_COLOR};
  padding: ${STYLES.PADDING};
  border-radius: ${STYLES.BORDER_RADIUS};
  display: flex;
  flex-direction: column;
  gap: ${STYLES.GAP};
  align-items: center;
  width: 100%;
`;

const InfoItem = styled.div`
  text-align: center;
  font-size: ${STYLES.FONT_SIZE};
  & > div:first-child {
    font-size: ${STYLES.SUB_FONT_SIZE};
    color: ${STYLES.SUB_TEXT_COLOR};
  }
`;

interface GameInfoProps {
  player: PlayerType;
}

const GameInfo: React.FC<GameInfoProps> = ({ player }) => {
  const { playerStates } = useGameStore();
  const playerData = playerStates[player];
  if (!playerData) return null;
  return (
    <InfoContainer>
      <InfoItem>
        <div>Player</div>
        <div>{playerData.playerName}</div>
      </InfoItem>
      <InfoItem>
        <div>Environment</div>
        <div>{`${playerData.currentEnvironment} / ${playerData.maxEnvironment}`}</div>
      </InfoItem>
    </InfoContainer>
  );
};

export default GameInfo;
