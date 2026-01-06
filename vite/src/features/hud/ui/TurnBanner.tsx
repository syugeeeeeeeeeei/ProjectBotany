// vite/src/features/hud/ui/TurnBanner.tsx
import React from "react";
import styled, { keyframes, css } from "styled-components";

// --- Keyframes ---
const slideIn = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

const fadeOut = keyframes`
  0% { opacity: 1; }
  100% { opacity: 0; }
`;

// --- Styled Components ---

/**
 * 外側のコンテナ (Positioner)
 * 役割: 画面上の配置位置と、対面用回転(rotate)のみを管理する。
 * アニメーションさせないことで transform の競合を防ぐ。
 */
const Positioner = styled.div<{ $side: "top" | "bottom" }>`
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  z-index: 150;
  pointer-events: none;
  display: flex;
  align-items: center; /* 垂直中央配置 */
  justify-content: center; /* 水平中央配置 */

  ${({ $side }) =>
    $side === "top"
      ? css`
          top: 0;
          transform: rotate(180deg);
        `
      : css`
          bottom: 0;
        `}
`;

/**
 * 内側のコンテナ (Animator)
 * 役割: スライドイン・フェードアウトのアニメーションのみを管理する。
 * ここで transform: translateX を動かしても、親の rotate には影響しない。
 */
const AnimatedContent = styled.div<{ $isExiting: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 40px 0;

  /* アニメーション制御 */
  animation: ${({ $isExiting }) =>
    $isExiting
      ? css`
          ${fadeOut} 0.5s ease-in forwards
        `
      : css`
          ${slideIn} 0.3s ease-out forwards
        `};
`;

const MainText = styled.h2`
  font-size: 2.5rem;
  color: white;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  margin: 0;
  padding: 10px 40px;
  background: rgba(0, 0, 0, 0.5);
  border-top: 2px solid white;
  border-bottom: 2px solid white;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
`;

const SubText = styled.div`
  font-size: 1.2rem;
  color: #ddd;
  margin-top: 10px;
  font-weight: bold;
`;

interface TurnBannerProps {
  side: "top" | "bottom";
  message: string;
  subMessage?: string;
  isExiting: boolean;
}

export const TurnBanner: React.FC<TurnBannerProps> = ({
  side,
  message,
  subMessage,
  isExiting,
}) => {
  return (
    <Positioner $side={side}>
      <AnimatedContent $isExiting={isExiting}>
        <MainText>{message}</MainText>
        {subMessage && <SubText>{subMessage}</SubText>}
      </AnimatedContent>
    </Positioner>
  );
};
