import React, { useState } from "react";
import styled, { css } from "styled-components";

// レイアウト定数
const LAYOUT = {
  WIDTH_OPEN: "260px",
  WIDTH_CLOSED: "80px",
  OFFSET: "0px",
};

// 内部コンテンツの最小幅（WIDTH_OPEN - padding左右）
// これを設定することで、パネルが広がる途中でも中身が折り返されずに表示される
const MIN_CONTENT_WIDTH = "240px";

type PanelPosition = "left" | "right";

const PanelContainer = styled.div<{
  $position: PanelPosition;
  $isOpen: boolean;
}>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: ${({ $isOpen }) =>
    $isOpen ? LAYOUT.WIDTH_OPEN : LAYOUT.WIDTH_CLOSED};
  height: auto;
  min-height: 200px;
  z-index: 100;
  pointer-events: none; /* コンテナ自体は透過 */
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  ${({ $position }) =>
    $position === "left"
      ? css`
          left: ${LAYOUT.OFFSET};
          /* 左側（Native/後攻）は対面用に180度回転 */
          .content-rotator {
            transform: rotate(180deg);
          }
        `
      : css`
          right: ${LAYOUT.OFFSET};
        `}
`;

const PanelContent = styled.div<{
  $position: PanelPosition;
  $isOpen: boolean;
  $isActive?: boolean;
  $accentColor?: string;
}>`
  pointer-events: auto;
  background: rgba(20, 20, 20, 0.85);
  backdrop-filter: blur(12px);

  /* デフォルトのボーダーまたはアクティブ時のボーダー */
  border: 1px solid
    ${({ $isActive, $accentColor }) =>
      $isActive && $accentColor ? $accentColor : "rgba(255, 255, 255, 0.1)"};

  border-radius: ${({ $position }) =>
    $position === "left" ? "0 12px 12px 0" : "12px 0 0 12px"};
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  /* アクティブ時は発光効果を追加、非アクティブ時は通常の影のみ */
  box-shadow: ${({ $isActive, $accentColor }) =>
    $isActive && $accentColor
      ? `0 0 15px ${$accentColor}66, 0 8px 32px rgba(0, 0, 0, 0.5)`
      : "0 8px 32px rgba(0, 0, 0, 0.5)"};

  overflow: hidden;
  transition: all 0.3s ease;

  /* 閉じたときの中身の制御 */
  ${({ $isOpen }) =>
    !$isOpen &&
    css`
      align-items: center;
      padding: 15px 5px;
    `}
`;

// アニメーション中のレイアウト崩れを防ぐラッパー
const InnerContentWrapper = styled.div<{ $isOpen: boolean }>`
  width: 100%;
  /* 開いている時は、コンテナが伸びている途中でも中身の幅を確保する */
  ${({ $isOpen }) =>
    $isOpen &&
    css`
      min-width: ${MIN_CONTENT_WIDTH};
    `}
`;

const ToggleButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #aaa;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 8px;
  font-size: 10px;
  text-transform: uppercase;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

interface SidePanelProps {
  position: PanelPosition;
  isActive?: boolean; // 手番かどうか
  accentColor?: string; // 強調色
  children: (isOpen: boolean) => React.ReactNode; // Render prop pattern
}

export const SidePanel: React.FC<SidePanelProps> = ({
  position,
  isActive,
  accentColor,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PanelContainer $position={position} $isOpen={isOpen}>
      <div
        className="content-rotator"
        style={{ width: "100%", height: "100%" }}
      >
        <PanelContent
          $position={position}
          $isOpen={isOpen}
          $isActive={isActive}
          $accentColor={accentColor}
        >
          <ToggleButton onClick={() => setIsOpen(!isOpen)}>
            {isOpen
              ? position === "left"
                ? "< CLOSE"
                : "CLOSE >"
              : position === "left"
                ? "MENU >"
                : "< MENU"}
          </ToggleButton>
          <InnerContentWrapper $isOpen={isOpen}>
            {children(isOpen)}
          </InnerContentWrapper>
        </PanelContent>
      </div>
    </PanelContainer>
  );
};
