import React from 'react';
import styled from 'styled-components';
import { useGameStore } from '../../../app/providers/StoreProvider';
import type { PlayerType } from '../../../shared/types/data';
import { CancelButton, SummonButton, TurnEndButton } from '../../../shared/ui/BaseButton/BaseButton';

const PanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
`;

const InfoBox = styled.div<{ $isActive: boolean }>`
  background: rgba(0, 0, 0, 0.6);
  padding: 10px;
  border-radius: 12px;
  width: 100%;
  border: 2px solid ${props => props.$isActive ? '#ffd700' : 'transparent'};
`;

const StatText = styled.div`
  font-size: 1.1rem;
  margin: 5px 0;
`;

interface SideControlPanelProps {
	player: PlayerType;
}

export const SideControlPanel: React.FC<SideControlPanelProps> = ({ player }) => {
	const {
		playerStates, activePlayerId, currentTurn, maximumTurns,
		isCardPreview, progressTurn, playSelectedCard, deselectCard, isGameOver
	} = useGameStore();

	const state = playerStates[player];
	const isMyTurn = activePlayerId === player;

	return (
		<PanelWrapper>
			<InfoBox $isActive={isMyTurn}>
				<div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{state.playerName}</div>
				<StatText>Turn: {currentTurn} / {maximumTurns}</StatText>
				<StatText>Env: {state.currentEnvironment} / {state.maxEnvironment}</StatText>
			</InfoBox>

			{isCardPreview && isMyTurn ? (
				<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
					<SummonButton onClick={playSelectedCard}>召喚</SummonButton>
					<CancelButton onClick={deselectCard}>取消</CancelButton>
				</div>
			) : (
				<TurnEndButton
					onClick={progressTurn}
					disabled={!isMyTurn || isGameOver}
				>
					ターン終了
				</TurnEndButton>
			)}
		</PanelWrapper>
	);
};