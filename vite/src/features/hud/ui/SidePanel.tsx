import React from "react";
import styled, { css } from "styled-components";

// レイアウト定数
const LAYOUT = {
  WIDTH: "140px",
  GAP: "20px",
  OFFSET: "10px", // 画面端からの距離
};

type PanelPosition = "left" | "right";

const PanelContainer = styled.div<{ $position: PanelPosition }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: ${LAYOUT.WIDTH};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${LAYOUT.GAP};
  z-index: 10;
  pointer-events: none; /* コンテナ自体はクリックを阻害しない */

  /* 子要素（コンテンツ）は操作可能にする */
  & > * {
    pointer-events: auto;
  }

  ${({ $position }) =>
    $position === "left"
      ? css`
          left: ${LAYOUT.OFFSET};
          /* 左側（Native/後攻）は対面用に180度回転 */
          & > .content-wrapper {
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 100%;
            transform: rotate(180deg);
          }
        `
      : css`
          right: ${LAYOUT.OFFSET};
          /* 右側（Alien/先攻）は通常表示 */
          & > .content-wrapper {
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 100%;
          }
        `}
`;

interface SidePanelProps {
  position: PanelPosition;
  children: React.ReactNode;
}

export const SidePanel: React.FC<SidePanelProps> = ({ position, children }) => {
  return (
    <PanelContainer $position={position}>
      <div className="content-wrapper">{children}</div>
    </PanelContainer>
  );
};
