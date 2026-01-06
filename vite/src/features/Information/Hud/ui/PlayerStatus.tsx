import React from "react";
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
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;

  .name {
    font-weight: 800;
    font-size: ${({ $compact }) => ($compact ? "0.9rem" : "1.15rem")};
    color: ${({ $color }) => $color};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ScoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .current-score {
    font-family: "Fira Code", monospace;
    font-size: 1.2rem;
    font-weight: bold;
    color: white;
  }

  .opponent-score {
    font-family: "Fira Code", monospace;
    font-size: 0.8rem;
    color: #999;
    margin-top: 2px;
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

  // 相手の情報を取得
  const opponentId = playerId === "alien" ? "native" : "alien";
  const opponentScore = useGameQuery.useScore(opponentId);
  const opponentLabel = opponentId === "alien" ? "外来種" : "在来種";

  const activePlayer = useGameQuery.useActivePlayer();
  const currentRound = useGameQuery.useCurrentRound();

  const isMyTurn = activePlayer === playerId;
  const themeColor = playerId === "alien" ? "#E57373" : "#66BB6A"; // Red / Green

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

  // --- Common AP Bar ---
  const ApBar = (
    <APDisplay>
      <StatRow>
        <span style={{ fontSize: isOpen ? "0.85rem" : "0.7rem" }}>
          {isOpen ? "エンバイロメント (AP)" : "AP"}
        </span>
        <span
          style={{
            fontWeight: "bold",
            color: "white",
            fontSize: isOpen ? "0.85rem" : "0.75rem",
          }}
        >
          {playerState.currentEnvironment} / {playerState.maxEnvironment}
        </span>
      </StatRow>
      <ProgressBarBg>
        <ProgressBarFill $percent={apPercent} $color={themeColor} />
      </ProgressBarBg>
    </APDisplay>
  );

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
              marginBottom: "4px",
            }}
          >
            {playerId === "alien" ? "外来種" : "在来種"}
          </div>
          <div
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            {score} 点
          </div>
        </div>

        {/* コンパクトでもAPを表示 */}
        {ApBar}

        {/* コンパクトでもターンエンドボタンは押せるようにする */}
        {isMyTurn && (
          <TurnEndButtonStyled
            $isActive={true}
            $themeColor={themeColor}
            onClick={handleTurnEnd}
            style={{ padding: "6px", fontSize: "0.7rem", marginTop: "8px" }}
          >
            終了
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
        <ScoreContainer>
          <div className="current-score">{score} 点</div>
          <div className="opponent-score">
            {opponentLabel}: {opponentScore} 点
          </div>
        </ScoreContainer>
      </Header>

      {/* AP Bar */}
      {ApBar}

      {/* 詳細情報 (COOLDOWN削除) */}

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
