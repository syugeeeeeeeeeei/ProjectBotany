import React from 'react';
import styled from 'styled-components';
import { useGameStore } from '../store/gameStore';
import type { PlayerId } from '../types/data';

const InfoContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 5px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  width: 100%;
`;

const InfoItem = styled.div`
  text-align: center;
  font-size: 1.3em;
  & > div:first-child {
    font-size: 0.8em;
    color: #aaa;
  }
`;

const GameInfo: React.FC<{ player: PlayerId }> = ({ player }) => {
  // 新しい `environment` state を使用
  const { environment } = useGameStore();
  const playerData = environment[player];

  return (
    <InfoContainer>
      <InfoItem>
        <div>Player</div>
        {/* playerNameはなくなったため、IDを大文字にして表示 */}
        <div>{player.toUpperCase()}</div>
      </InfoItem>
      <InfoItem>
        <div>Environment</div>
        <div>
          {playerData.current} / {playerData.max}
        </div>
      </InfoItem>
    </InfoContainer>
  );
};

export default GameInfo;