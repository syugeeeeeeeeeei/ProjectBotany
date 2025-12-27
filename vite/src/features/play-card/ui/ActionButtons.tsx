import React from 'react';
import { useUIStore } from '../../../app/store/useUIStore';
import { useGameStore } from '../../../app/store/useGameStore';
import { BaseActionButton, ActionButtonContainer } from '../../../shared/components/BaseActionButton';
import styled from 'styled-components';

const SummonButton = styled(BaseActionButton)`
  background: linear-gradient(145deg, #ffc107, #ff8f00);
  font-size: 1em;
`;

const CancelButton = styled(BaseActionButton)`
  background: linear-gradient(145deg, #9e9e9e, #616161);
  font-size: 1em;
`;

const ActionButtons: React.FC = () => {
	const { selectedCardId, previewPlacement, deselectCard, setNotification } = useUIStore();
	const { playCard, gameField, activePlayerId } = useGameStore();

	const handleSummon = () => {
		if (!selectedCardId || !previewPlacement) return;

		const targetCell = gameField.cells[previewPlacement.y][previewPlacement.x];
		const error = playCard(selectedCardId, targetCell);

		if (error) {
			setNotification(error, activePlayerId);
		} else {
			deselectCard();
		}
	};

	return (
		<ActionButtonContainer>
			<SummonButton onClick={handleSummon}>召喚</SummonButton>
			<CancelButton onClick={deselectCard}>取消</CancelButton>
		</ActionButtonContainer>
	);
};

export default ActionButtons;