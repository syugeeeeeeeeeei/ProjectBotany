import React from "react";
import styled from "styled-components";
import { useGameQuery } from "@/core/api/queries";
import { gameActions } from "@/core/api/actions";

const SettingsContainer = styled.div`
  padding: 12px;
  background: #252525;
  border-bottom: 1px solid #444;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  pointer-events: auto;
`;

const SettingItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #efefef;
  font-size: 12px;
  cursor: pointer;
  user-select: none;

  input {
    cursor: pointer;
  }
`;

export const DebugSettings: React.FC = () => {
  // ✨ ストアから showFps も取得
  const { showGestureArea, showFps } = useGameQuery.ui.useDebugSettings();

  const handleGestureToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    gameActions.ui.updateDebugSettings({ showGestureArea: e.target.checked });
  };

  const handleFpsToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    gameActions.ui.updateDebugSettings({ showFps: e.target.checked });
  };

  return (
    <SettingsContainer>
      <SettingItem>
        <input
          type="checkbox"
          checked={showGestureArea}
          onChange={handleGestureToggle}
        />
        <span>Gesture Area 🟢</span>
      </SettingItem>

      <SettingItem>
        <input type="checkbox" checked={showFps} onChange={handleFpsToggle} />
        <span>Show FPS 📈</span>
      </SettingItem>
      {/* 今後ここに他の設定を追加可能 */}
    </SettingsContainer>
  );
};
