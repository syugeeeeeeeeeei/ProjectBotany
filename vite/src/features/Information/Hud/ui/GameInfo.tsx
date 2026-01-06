// vite/src/features/hud/ui/GameInfo.tsx
import React from "react";
import styled from "styled-components";
import { useGameQuery } from "@/core/api/queries";

const InfoContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #555;
  font-family: sans-serif;
  pointer-events: none;
  min-width: 200px;
`;

const PlayerRow = styled.div<{ $active: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 8px;
  background: ${(props) =>
    props.$active ? "rgba(255, 255, 255, 0.15)" : "transparent"};
  border-radius: 4px;
  border: ${(props) =>
    props.$active ? "1px solid #aaa" : "1px solid transparent"};
`;

const APBadge = styled.span`
  background: #2196f3;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
`;

const ScoreText = styled.span`
  font-size: 18px;
  font-weight: bold;
`;

export const GameInfo: React.FC = () => {
  const round = useGameQuery.useCurrentRound();
  const activePlayer = useGameQuery.useActivePlayer();
  const nativeState = useGameQuery.usePlayer("native");
  const alienState = useGameQuery.usePlayer("alien");
  const nativeScore = useGameQuery.useScore("native");
  const alienScore = useGameQuery.useScore("alien");

  return (
    <InfoContainer>
      <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "10px" }}>
        ROUND {round} / 8
      </div>

      <PlayerRow $active={activePlayer === "alien"}>
        <div>
          <div style={{ color: "#E91E63", fontWeight: "bold" }}>
            外来種 (ALIEN)
          </div>
          <APBadge>
            AP: {alienState?.currentEnvironment} / {alienState?.maxEnvironment}
          </APBadge>
        </div>
        <ScoreText style={{ color: "#E91E63" }}>{alienScore}</ScoreText>
      </PlayerRow>

      <PlayerRow $active={activePlayer === "native"}>
        <div>
          <div style={{ color: "#4CAF50", fontWeight: "bold" }}>
            在来種 (NATIVE)
          </div>
          <APBadge>
            AP: {nativeState?.currentEnvironment} /{" "}
            {nativeState?.maxEnvironment}
          </APBadge>
        </div>
        <ScoreText style={{ color: "#4CAF50" }}>{nativeScore}</ScoreText>
      </PlayerRow>

      {activePlayer && (
        <div
          style={{
            textAlign: "center",
            marginTop: "10px",
            fontSize: "14px",
            borderTop: "1px solid #444",
            paddingTop: "10px",
          }}
        >
          現在の手番:{" "}
          <span
            style={{
              fontWeight: "bold",
              color: activePlayer === "alien" ? "#E91E63" : "#4CAF50",
            }}
          >
            {activePlayer.toUpperCase()}
          </span>
        </div>
      )}
    </InfoContainer>
  );
};
