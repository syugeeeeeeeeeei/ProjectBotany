import React from "react";
import styled from "styled-components";
import { useGameQuery } from "@/core/api/queries";
import { PlayerType } from "@/shared/types";

const STYLES = {
  BACKGROUND_COLOR: "rgba(0, 0, 0, 0.7)",
  TEXT_COLOR: "white",
  SUB_TEXT_COLOR: "#aaa",
  PADDING: "10px 5px",
  BORDER_RADIUS: "8px",
  GAP: "10px",
  FONT_SIZE: "1.2rem",
  SUB_FONT_SIZE: "0.8rem",
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
  pointer-events: auto; /* ボタンなどを配置した場合に備えて */
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const InfoItem = styled.div`
  text-align: center;
  font-size: ${STYLES.FONT_SIZE};
  width: 100%;

  & > div:first-child {
    font-size: ${STYLES.SUB_FONT_SIZE};
    color: ${STYLES.SUB_TEXT_COLOR};
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  & > div:last-child {
    font-weight: bold;
  }
`;

const ScoreBadge = styled.div<{ $isLeading: boolean }>`
  color: ${({ $isLeading }) => ($isLeading ? "#4CAF50" : "inherit")};
`;

interface PlayerStatusProps {
  playerId: PlayerType;
}

export const PlayerStatus: React.FC<PlayerStatusProps> = ({ playerId }) => {
  // Query経由でデータを取得 (Storeに直接依存しない)
  const playerState = useGameQuery.usePlayer(playerId);
  const score = useGameQuery.useScore(playerId);
  const opponentId = playerId === "alien" ? "native" : "alien";
  const opponentScore = useGameQuery.useScore(opponentId);

  if (!playerState) return null;

  const isLeading = score > opponentScore;

  return (
    <InfoContainer>
      <InfoItem>
        <div>Player</div>
        <div>{playerState.playerName}</div>
      </InfoItem>

      <InfoItem>
        <div>Environment (AP)</div>
        <div>{`${playerState.currentEnvironment} / ${playerState.maxEnvironment}`}</div>
      </InfoItem>

      <InfoItem>
        <div>Score</div>
        <ScoreBadge $isLeading={isLeading}>{score}</ScoreBadge>
      </InfoItem>
    </InfoContainer>
  );
};
