import { animated, useSpring } from '@react-spring/three';
import { useThree } from '@react-three/fiber';
import { useGesture } from '@use-gesture/react';
import React from 'react';
import { useGameStore } from '../../../app/providers/StoreProvider';
import { Card3D } from '../../../entities/card/ui/Card3D';
import { HAND_PAGING } from '../../../shared/config/gameConfig';
import type { CardDefinition, PlayerType } from '../../../shared/types/data';

interface PlayerHandProps {
	player: PlayerType;
	cards: (CardDefinition & { instanceId: string })[];
	isVisible: boolean;
	currentPage: number;
	onPageChange: (page: number) => void;
	isInteractionLocked?: boolean;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
	player,
	cards,
	isVisible,
	currentPage,
	onPageChange,
	isInteractionLocked
}) => {
	const { viewport } = useThree();
	const { activePlayerId, selectedCardId, selectCard } = useGameStore();

	const isMyTurn = activePlayerId === player;
	const isOpponent = player === 'native';

	const yPos = isOpponent ? viewport.height / 2 - 1 : -viewport.height / 2 + 1;
	const rotationZ = isOpponent ? Math.PI : 0;

	const { positionY } = useSpring({
		positionY: isVisible ? yPos : (isOpponent ? yPos + 4 : yPos - 4),
		config: { mass: 1, tension: 280, friction: 60 }
	});

	const bind = useGesture({
		onDrag: ({ velocity: [vx], distance: [dx], direction: [xDir], last }) => {
			if (!last || dx < 50 || Math.abs(vx) < 0.2) return;
			const maxPage = Math.ceil(cards.length / HAND_PAGING.CARDS_PER_PAGE) - 1;
			if (xDir > 0) onPageChange(Math.max(0, currentPage - 1));
			else onPageChange(Math.min(maxPage, currentPage + 1));
		}
	});

	const pageCards = cards.slice(
		currentPage * HAND_PAGING.CARDS_PER_PAGE,
		(currentPage + 1) * HAND_PAGING.CARDS_PER_PAGE
	);

	return (
		<animated.group position-y={positionY} position-z={5} rotation-z={rotationZ} {...(isInteractionLocked ? {} : bind())}>
			{pageCards.map((card, i) => {
				const xPos = (i - (pageCards.length - 1) / 2) * 2.2;
				return (
					<group key={card.instanceId} position-x={xPos}>
						<Card3D
							card={card}
							isSelected={selectedCardId === card.instanceId}
							onClick={() => isMyTurn && !isInteractionLocked && selectCard(card.instanceId)}
							opacity={isMyTurn ? 1 : 0.5}
						/>
					</group>
				);
			})}
		</animated.group>
	);
};