import { animated, useSpring } from '@react-spring/three';
import { useThree } from '@react-three/fiber';
import { useGesture } from '@use-gesture/react';
import React from 'react';
import { useGameStore } from '../../../app/providers/StoreProvider';
import { Card3D } from '../../../entities/card/ui/Card3D';
import { DEBUG_SETTINGS, HAND_LAYOUT, HAND_PAGING } from '../../../shared/config/gameConfig';
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

	// ConfigからY座標位置を計算
	const yPos = isOpponent
		? viewport.height / 2 - HAND_LAYOUT.Y_OFFSET_FROM_EDGE
		: -viewport.height / 2 + HAND_LAYOUT.Y_OFFSET_FROM_EDGE;
	const rotationZ = isOpponent ? Math.PI : 0;

	const { positionY } = useSpring({
		positionY: isVisible ? yPos : (isOpponent ? yPos + 4 : yPos - 4),
		config: { mass: 1, tension: 280, friction: 60 }
	});

	const bind = useGesture({
		onDrag: ({ velocity: [vx], distance: [dx], direction: [xDir], last }) => {
			if (!last || dx < HAND_LAYOUT.SWIPE_THRESHOLD_DISTANCE || Math.abs(vx) < HAND_LAYOUT.SWIPE_THRESHOLD_VELOCITY) return;
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
		<animated.group
			position-y={positionY}
			position-z={HAND_LAYOUT.Z_POSITION}
			rotation-z={rotationZ}
			{...(isInteractionLocked ? {} : bind())}
		>
			{/* スワイプ判定用のヒットボックス（デバッグ設定で可視化可能） */}
			<mesh position={[0, 0, -0.1]}>
				<planeGeometry args={HAND_LAYOUT.HITBOX_SIZE} />
				<meshBasicMaterial
					color="#ff0000"
					transparent
					opacity={DEBUG_SETTINGS.SHOW_SWIPE_AREA ? 0.3 : 0}
					visible={true} // レイトレーシングのためにvisibleはtrueのまま、opacityで制御
				/>
			</mesh>

			{pageCards.map((card, i) => {
				const xPos = (i - (pageCards.length - 1) / 2) * HAND_LAYOUT.CARD_SPACING;
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