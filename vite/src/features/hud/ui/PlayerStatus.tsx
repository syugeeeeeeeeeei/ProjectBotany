import React, { useMemo } from "react";
import styled, { css } from "styled-components";
import { useGameQuery, gameActions } from "@/core/api";
import { PlayerType } from "@/shared/types";
import { BaseActionButton } from "@/shared/components/BaseActionButton";

// --- Styles ---

const StatusWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: white;
  font-family: "Inter", sans-serif;
`;

const Header = styled.div<{ $color: string; $compact: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;

  .name {
    font-weight: 800;
    font-size: ${({ $compact }) => ($compact ? "0.9rem" : "1.1rem")};
    color: ${({ $color }) => $color};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .score {
    font-family: "Fira Code", monospace;
    font-size: 1.2rem;
    font-weight: bold;
  }
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #ccc;
`;

const ProgressBarBg = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin-top: 4px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ $percent: number; $color: string }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: ${({ $color }) => $color};
  transition: width 0.5s ease-out;
`;

const APDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  font-size: 0.75rem;
  color: #888;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px;
  border-radius: 6px;
`;

const TurnEndButtonStyled = styled(BaseActionButton)<{
  $isActive: boolean;
  $themeColor: string;
}>`
  font-size: 0.9rem;
  padding: 10px;
  margin-top: 5px;
  background: ${({ $isActive, $themeColor }) =>
    $isActive ? $themeColor : "#333"};
  border: ${({ $isActive, $themeColor }) =>
    $isActive ? `1px solid ${$themeColor}` : "1px solid #555"};

  ${({ $isActive }) =>
    !$isActive &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    `}
`;

// --- Component ---

interface PlayerStatusProps {
  playerId: PlayerType;
  isOpen: boolean; // SidePanelから渡される状態
}

export const PlayerStatus: React.FC<PlayerStatusProps> = ({
  playerId,
  isOpen,
}) => {
  const playerState = useGameQuery.usePlayer(playerId);
  const score = useGameQuery.useScore(playerId);
  const activePlayer = useGameQuery.useActivePlayer();
  const currentRound = useGameQuery.useCurrentRound();

  const isMyTurn = activePlayer === playerId;
  const themeColor = playerId === "alien" ? "#E57373" : "#66BB6A"; // Red / Green

  // デッキ残り枚数計算（Libraryにあるカード数）
  const deckCount = useMemo(
    () => playerState?.cardLibrary.length ?? 0,
    [playerState],
  );
  // クールダウン中のカード枚数
  const cooldownCount = useMemo(
    () => playerState?.cooldownActiveCards.length ?? 0,
    [playerState],
  );

  if (!playerState) return null;

  const apPercent =
    (playerState.currentEnvironment / playerState.maxEnvironment) * 100;

  const handleTurnEnd = () => {
    if (!isMyTurn) {
      gameActions.ui.notify({
        message: "相手のターンです",
        type: "error",
        player: playerId,
      });
      return;
    }
    gameActions.turn.end();
  };

  // --- Compact View (Closed) ---
  if (!isOpen) {
    return (
      <StatusWrapper>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.7rem",
              color: themeColor,
              fontWeight: "bold",
            }}
          >
            {playerId.toUpperCase()}
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{score}</div>
        </div>

        {/* コンパクトでもターンエンドボタンは押せるようにする（緊急用） */}
        {isMyTurn && (
          <TurnEndButtonStyled
            $isActive={true}
            $themeColor={themeColor}
            onClick={handleTurnEnd}
            style={{ padding: "4px", fontSize: "0.7rem" }}
          >
            END
          </TurnEndButtonStyled>
        )}
      </StatusWrapper>
    );
  }

  // --- Full View (Open) ---
  return (
    <StatusWrapper>
      <Header $color={themeColor} $compact={false}>
        <div className="name">{playerState.playerName}</div>
        <div className="score">{score} pts</div>
      </Header>

      {/* AP Bar */}
      <APDisplay>
        <StatRow>
          <span>Environment (AP)</span>
          <span style={{ fontWeight: "bold", color: "white" }}>
            {playerState.currentEnvironment} / {playerState.maxEnvironment}
          </span>
        </StatRow>
        <ProgressBarBg>
          <ProgressBarFill $percent={apPercent} $color={themeColor} />
        </ProgressBarBg>
      </APDisplay>

      {/* Details */}
      <DetailGrid>
        <div>
          <div>DECK</div>
          <div style={{ color: "white", fontSize: "1rem" }}>{deckCount}</div>
        </div>
        <div>
          <div>COOLDOWN</div>
          <div style={{ color: "white", fontSize: "1rem" }}>
            {cooldownCount}
          </div>
        </div>
      </DetailGrid>

      {/* Turn End Button Integration */}
      <TurnEndButtonStyled
        $isActive={isMyTurn}
        $themeColor={themeColor}
        onClick={handleTurnEnd}
        disabled={!isMyTurn}
      >
        {isMyTurn ? `ターン終了 (R${currentRound})` : "相手のターン中..."}
      </TurnEndButtonStyled>
    </StatusWrapper>
  );
};
