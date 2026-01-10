import React from "react";
import styled from "styled-components";
import { BaseActionButton } from "@/shared/components/BaseActionButton";

const Container = styled.div<{ $side: "top" | "bottom" }>`
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
  z-index: 100;
  pointer-events: auto;
  border-bottom: 1px solid #333;
  border-top: 2px solid;
  ${({ $side }) =>
    $side === "top" ? "top: 0; transform: rotate(180deg);" : "bottom: 0;"}
`;

const Title = styled.h1`
  font-size: 3rem;
  background: linear-gradient(180deg, #36d63eff, #162716ff);
  margin-bottom: 1rem;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(76, 175, 80, 0.3);
  text-align: center;
  white-space: pre-wrap;
`;

const SubTitle = styled.h2`
  margin-bottom: 5rem;
  margin-top: 0;
  font-size: 2.5rem;
  color: #aaa;
`;

interface TitleScreenProps {
  side: "top" | "bottom";
  onStart: () => void;
  // ✨ 追加: 準備完了状態を受け取る
  isReady: boolean;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  side,
  onStart,
  isReady,
}) => {
  return (
    <Container $side={side}>
      <Title>『侵緑』</Title>
      <SubTitle>~外来種vs在来種陣取りゲーム~</SubTitle>
      <div>
        <BaseActionButton
          onClick={onStart}
          disabled={isReady} // 準備完了済なら無効化
          style={{
            padding: "15px 35px",
            fontSize: "1.5rem",
            // 準備完了ならグレーアウト、未完了なら緑
            backgroundColor: isReady ? "#555" : "#2E7D32",
            border: isReady ? "1px solid #777" : "1px solid #4CAF50",
            cursor: isReady ? "default" : "pointer",
          }}
        >
          {isReady ? "待機中..." : "ゲーム開始"}
        </BaseActionButton>
      </div>
    </Container>
  );
};
