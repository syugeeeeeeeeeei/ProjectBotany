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
  flex-direction: column; /* ★修正: 縦並びに変更 */
  gap: 10px; /* ★追加: 要素間のスペース */
  align-items: center; /* ★追加: 中央揃え */
  width: 100%; /* ★修正: 横幅を親要素に合わせる */
`;

const InfoItem = styled.div`
  text-align: center;
  font-size: 1.3em; /* ★修正: 少し大きく */
  & > div:first-child {
    font-size: 0.8em;
    color: #aaa;
  }
`;

// ★修正: playerのIDを受け取るようにPropsを変更
const GameInfo: React.FC<{ player: PlayerId }> = ({ player }) => {
	const { playerStates } = useGameStore();
	const playerData = playerStates[player];

	return (
		<InfoContainer>
			<InfoItem>
				<div>Player</div>
				<div>{playerData.playerName}</div>
			</InfoItem>
			<InfoItem>
				<div>Environment</div>
				<div>{playerData.currentEnvironment} / {playerData.maxEnvironment}</div>
			</InfoItem>
		</InfoContainer>
	);
};

export default GameInfo;