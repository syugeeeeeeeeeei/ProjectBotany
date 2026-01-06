import React, { useState } from "react";
import styled from "styled-components";
import { OnScreenConsole } from "./OnScreenConsole";
import { DebugSettings } from "./DebugSettings";

const DashboardWrapper = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: calc(100% - 40px);
  max-width: 650px;
  height: ${(props) => (props.$isOpen ? "450px" : "0px")};
  background-color: rgba(15, 15, 15, 0.96);
  backdrop-filter: blur(12px);
  border: ${(props) => (props.$isOpen ? "1px solid #00ff0044" : "none")};
  border-radius: 12px;
  z-index: 100000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
  pointer-events: auto; /* ✨ クリックを有効化 */
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  transform: translateY(${(props) => (props.$isOpen ? "0" : "20px")});
`;

const ToggleButton = styled.button`
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 100001;
  background: #000;
  color: #0f0;
  border: 1px solid #0f0;
  padding: 8px 16px;
  font-size: 12px;
  font-family: "Fira Code", monospace;
  font-weight: bold;
  cursor: pointer;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  pointer-events: auto; /* ✨ クリックを有効化 */

  &:hover {
    background: #0a250a;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  color: #0f0;
  font-size: 12px;
  font-family: monospace;
  font-weight: bold;
`;

const CloseBtn = styled.button`
  background: none;
  border: 1px solid #444;
  color: #888;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  &:hover {
    color: #fff;
    border-color: #666;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

export const DebugDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <ToggleButton onClick={() => setIsOpen(true)}>
          {">"} DEBUG DASHBOARD
        </ToggleButton>
      )}

      <DashboardWrapper $isOpen={isOpen}>
        <Header>
          <span>TERMINAL :: DEBUG_MODE</span>
          <CloseBtn onClick={() => setIsOpen(false)}>MINIMIZE</CloseBtn>
        </Header>

        <Content>
          {/* 上部：各種設定 */}
          <DebugSettings />

          {/* 下部：ログコンソール */}
          <OnScreenConsole isEmbedded />
        </Content>
      </DashboardWrapper>
    </>
  );
};
