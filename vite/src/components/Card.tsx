import React from 'react';
import styled from 'styled-components';
import { useGameStore } from '../store/gameStore';
import type { CardDefinition } from '../types/data';

interface CardProps {
	card: CardDefinition;
}

// ✨ プロパティ名の前に `$` を追加
const CardContainer = styled.div<{ $isSelected: boolean }>`
  border: ${({ $isSelected }) => ($isSelected ? '2px solid yellow' : '1px solid #ccc')};
  border-radius: 8px;
  padding: 16px;
  width: 150px;
  height: 210px;
  background-color: #2a2a2a;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  margin: 10px;
  cursor: pointer;
  transform: ${({ $isSelected }) => ($isSelected ? 'scale(1.05)' : 'scale(1)')};
  transition: all 0.2s ease-in-out;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: bold;
`;

const CardBody = styled.div`
  font-size: 0.8em;
`;

const Card: React.FC<CardProps> = ({ card }) => {
	const selectCard = useGameStore((state) => state.selectCard);
	const selectedCardId = useGameStore((state) => state.selectedCardId);

	const isSelected = selectedCardId === card.id;

	const handleCardClick = () => {
		selectCard(isSelected ? null : card.id);
	};

	return (
		// ✨ ここでも `$` 付きのプロパティとして渡す
		<CardContainer onClick={handleCardClick} $isSelected={isSelected}>
			<CardHeader>
				<span>{card.name}</span>
				<span>Cost: {card.cost}</span>
			</CardHeader>
			<CardBody>
				<p>{card.description}</p>
			</CardBody>
			<div>Type: {card.cardType}</div>
		</CardContainer>
	);
};

export default Card;