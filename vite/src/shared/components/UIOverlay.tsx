import React from "react";
import styled from "styled-components";

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* デフォルトではクリックを透過 */
  z-index: 10;
  overflow: hidden;

  /* 子要素で pointer-events: auto を指定すればクリック可能 */
  > * {
    pointer-events: auto;
  }
`;

/**
 * UI要素を表示するための全画面オーバーレイコンテナ。
 * ロジックは持たず、FeatureがrenderUIでこの中に要素を流し込む。
 */
export const UIOverlay: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return <OverlayContainer>{children}</OverlayContainer>;
};
