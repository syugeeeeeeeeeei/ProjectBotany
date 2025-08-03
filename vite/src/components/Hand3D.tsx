import { animated, to, useSpring } from '@react-spring/three';
import { Plane } from '@react-three/drei';
import { useGesture } from '@use-gesture/react';
import React, { useEffect, useMemo, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import type { CardDefinition, PlayerId } from '../types/data';
import Card3D from './Card3D';
import type { DebugSettings } from './DebugDialog';

type CardWithInstanceId = CardDefinition & { instanceId: string };

interface Hand3DProps {
	player: PlayerId;
	cards: CardWithInstanceId[];
	isVisible: boolean;
	onVisibilityChange: (visible: boolean) => void;
	currentPage: number;
	onPageChange: (page: number) => void;
	debugSettings: DebugSettings;
	isInteractionLocked: boolean;
};

const CARDS_PER_PAGE = 3;
const CARD_WIDTH = 1.8;
const CARD_SPACING = 0.8;
const PAGE_WIDTH = (CARDS_PER_PAGE * CARD_WIDTH) + ((CARDS_PER_PAGE - 1) * CARD_SPACING);

const Hand3D: React.FC<Hand3DProps> = ({
	player,
	cards,
	isVisible,
	onVisibilityChange,
	currentPage,
	onPageChange,
	debugSettings,
	isInteractionLocked
}) => {
	const { isGestureAreaVisible, flickVelocityThreshold, swipeAreaHeight } = debugSettings;
	const { selectCard, selectedCardId } = useGameStore();

	const isTopPlayer = player === 'native_side';
	const maxPage = Math.ceil(cards.length / CARDS_PER_PAGE) - 1;

	const isVisibleRef = useRef(isVisible);
	useEffect(() => {
		isVisibleRef.current = isVisible;
	}, [isVisible]);


	const { x } = useSpring({
		x: -currentPage * (PAGE_WIDTH + 1),
		config: { tension: 300, friction: 30 },
	});

	const bind = useGesture(
		{
			onDrag: ({ last, movement: [mx, my], velocity: [vx, vy], direction: [dx, dy], tap, event }) => {
				if (tap || !last) return;

				event.stopPropagation();

				const FLICK_DISTANCE_THRESHOLD = 30;
				const absMx = Math.abs(mx);
				const absMy = Math.abs(my);

				if (absMx > absMy && absMx > FLICK_DISTANCE_THRESHOLD && Math.abs(vx) > flickVelocityThreshold) {
					const newPage = Math.max(0, Math.min(maxPage, currentPage - Math.sign(dx)));
					if (newPage !== currentPage) onPageChange(newPage);
					return;
				}

				if (absMy > absMx && absMy > FLICK_DISTANCE_THRESHOLD && Math.abs(vy) > (flickVelocityThreshold * 0.5)) {
					const swipeUp = dy < 0;
					if (isTopPlayer) {
						if (swipeUp && isVisibleRef.current) onVisibilityChange(false);
						if (!swipeUp && !isVisibleRef.current) onVisibilityChange(true);
					} else {
						if (swipeUp && !isVisibleRef.current) onVisibilityChange(true);
						if (!swipeUp && isVisibleRef.current) onVisibilityChange(false);
					}
				}
			},
			onClick: ({ event }) => {
				event.stopPropagation();
				if (isVisibleRef.current && selectedCardId) {
					selectCard(null);
				}
			},
		},
		{
			enabled: !isInteractionLocked,
			drag: {
				filterTaps: true,
				threshold: 10,
			},
		}
	);

	const { z } = useSpring({
		z: isVisible ? 3.5 : 6,
		config: { tension: 300, friction: 20 },
	});

	const positionY = 2.2;

	const pages = useMemo(() => {
		const result: CardWithInstanceId[][] = [];
		for (let i = 0; i < cards.length; i += CARDS_PER_PAGE) {
			result.push(cards.slice(i, i + CARDS_PER_PAGE));
		}
		return result;
	}, [cards]);

	return (
		<animated.group position={to([z], (zVal) => [0, positionY, isTopPlayer ? -zVal : zVal])}>
			<Plane
				args={[PAGE_WIDTH + 4, swipeAreaHeight]}
				rotation={[-Math.PI / 2, 0, 0]}
				position={[0, -0.2, 0.1]}
				{...bind()}
			>
				<meshStandardMaterial
					color="red"
					transparent
					opacity={0.3}
					visible={isGestureAreaVisible}
				/>
			</Plane>

			<animated.group position-x={x}>
				{pages.map((pageCards, pageIndex) => (
					<group key={pageIndex} position={[pageIndex * (PAGE_WIDTH + 1), 0, 0]}>
						{pageCards.map((card, cardIndex) => (
							<CardInLine
								key={card.instanceId}
								card={card}
								index={cardIndex}
								player={player}
								isTopPlayer={isTopPlayer}
								isSelected={selectedCardId === card.instanceId}
								isListVisible={isVisible}
								selectedCardIdInList={selectedCardId}
							/>
						))}
					</group>
				))}
			</animated.group>
		</animated.group>
	);
};

interface CardInLineProps {
	card: CardWithInstanceId;
	index: number;
	player: PlayerId;
	isTopPlayer: boolean;
	isSelected: boolean;
	isListVisible: boolean;
	selectedCardIdInList: string | null;
}

const CardInLine: React.FC<CardInLineProps> = ({ card, index, player, isTopPlayer, isSelected, isListVisible, selectedCardIdInList }) => {
	const totalWidth = (CARDS_PER_PAGE * CARD_WIDTH) + (Math.max(0, CARDS_PER_PAGE - 1) * CARD_SPACING);
	const startX = -totalWidth / 2;
	const xPos = startX + index * (CARD_WIDTH + CARD_SPACING) + CARD_WIDTH / 2;
	const tiltAngle = isTopPlayer ? Math.PI / 2.2 : -Math.PI / 2.2;
	const yRotation = isTopPlayer ? Math.PI : 0;

	const isAnyCardSelected = selectedCardIdInList !== null;

	const { z, opacity } = useSpring({
		// ★修正: 状態管理ロジックをシンプルに
		// 選択されたカードはZ=0に、選択されていない他のカードは奥(Z=-1)に移動
		z: isSelected ? -0.5 : 0,
		opacity: isListVisible ? 1 : (isSelected ? 1 : 0.5),
		config: { tension: 300, friction: 20 }
	});

	return (
		<animated.group position-x={xPos} position-z={z}>
			<group rotation={[tiltAngle, yRotation, 0]} scale={1.25}>
				<Card3D
					card={card}
					position={[0, 0, 0]}
					player={player}
					width={CARD_WIDTH}
					opacity={opacity}
				/>
			</group>
		</animated.group>
	);
};

export default Hand3D;