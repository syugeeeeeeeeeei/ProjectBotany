import React from 'react';
import styled from 'styled-components';
import { useGameStore } from '../store/gameStore';

const InfoContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-around;
  width: 80%;
  max-width: 500px;
`;

const InfoItem = styled.div`
  text-align: center;
`;

const GameInfo: React.FC = () => {
	const { currentTurn, maximumTurns, activePlayerId, playerStates } = useGameStore();

	return (
		<InfoContainer>
			<InfoItem>
				<div>Turn</div>
				<div>{currentTurn} / {maximumTurns}</div>
			</InfoItem>
			<InfoItem>
				<div>Active Player</div>
				<div>{playerStates[activePlayerId].playerName}</div>
			</InfoItem>
			<InfoItem>
				<div>Environment</div>
				<div>{playerStates[activePlayerId].currentEnvironment} / {playerStates[activePlayerId].maxEnvironment}</div>
			</InfoItem>
		</InfoContainer>
	);
};

export default GameInfo;