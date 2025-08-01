import { animated, to, useSpring } from '@react-spring/three';
import { Plane } from '@react-three/drei';
import { useGesture } from '@use-gesture/react';
import React, { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import type { CardDefinition } from '../types/data';
import Card3D from './Card3D';
import type { DebugSettings } from './DebugDialog';

type CardWithInstanceId = CardDefinition & { instanceId: string };

interface Hand3DProps {
	player: 'native_side' | 'alien_side';
	cards: CardWithInstanceId[];
	isVisible: boolean;
	onVisibilityChange: (visible: boolean) => void;
	currentPage: number;
	onPageChange: (page: number) => void;
	debugSettings: DebugSettings;
};

const CARDS_PER_PAGE = 4;
const CARD_WIDTH = 1.7;
const CARD_SPACING = 0.2;
const PAGE_WIDTH = (CARDS_PER_PAGE * CARD_WIDTH) + ((CARDS_PER_PAGE - 1) * CARD_SPACING);

const Hand3D: React.FC<Hand3DProps> = ({
	player,
	cards,
	isVisible,
	onVisibilityChange,
	currentPage,
	onPageChange,
	debugSettings
}) => {
	const { isGestureAreaVisible, flickDistanceRatio, flickVelocityThreshold, swipeAreaHeight } = debugSettings;
	const { selectCard } = useGameStore();

	const isTopPlayer = player === 'native_side';
	const maxPage = Math.ceil(cards.length / CARDS_PER_PAGE) - 1;

	const { x } = useSpring({
		x: -currentPage * (PAGE_WIDTH + 1),
		config: { tension: 300, friction: 30 },
	});

	const bind = useGesture(
		{
			onDrag: ({ last, movement: [mx, my], velocity: [vx, vy], direction: [dx, dy], tap }) => {
				if (tap || !last) return; // タップやドラッグ中は無視し、ドラッグ終了時のみ判定

				const absMx = Math.abs(mx);
				const absMy = Math.abs(my);

				if (absMx > absMy) { // 横方向のフリック
					if (absMx > PAGE_WIDTH * flickDistanceRatio && Math.abs(vx) > flickVelocityThreshold) {
						const newPage = Math.max(0, Math.min(maxPage, currentPage - Math.sign(dx)));
						if (newPage !== currentPage) onPageChange(newPage);
					}
				} else { // 縦方向のスワイプ
					if (absMy > 50 && Math.abs(vy) > 0.2) {
						const swipeUp = dy < 0;
						// 修正：下にスワイプで非表示、上にスワイプで表示
						if (swipeUp) { // 上スワイプ
							if (!isVisible) onVisibilityChange(true); // Hide状態ならShowへ
						} else { // 下スワイプ
							if (isVisible) onVisibilityChange(false); // Show状態ならHideへ
						}
					}
				}
			},
			onClick: ({ event }) => {
				// カード以外の背景部分をタップしたら選択解除
				event.stopPropagation();
				if (useGameStore.getState().selectedCardId) {
					selectCard(null);
				}
			},
		},
		{
			drag: {
				filterTaps: true,
				threshold: 10,
			},
		}
	);

	const { z } = useSpring({
		z: isVisible ? 4 : 5.5,
		config: { tension: 200, friction: 20 },
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
				args={[PAGE_WIDTH + 2, swipeAreaHeight]}
				rotation={[-Math.PI / 2, 0, 0]}
				position={[0, 0, 0.1]}
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
								total={pageCards.length}
								player={player}
								isTopPlayer={isTopPlayer}
							/>
						))}
					</group>
				))}
			</animated.group>
		</animated.group>
	);
};

const CardInLine: React.FC<{
	card: CardWithInstanceId;
	index: number;
	total: number;
	player: 'native_side' | 'alien_side';
	isTopPlayer: boolean;
}> = ({ card, index, total, player, isTopPlayer }) => {
	const totalWidth = (total * CARD_WIDTH) + (Math.max(0, total - 1) * CARD_SPACING);
	const startX = -totalWidth / 2;
	const xPos = startX + index * (CARD_WIDTH + CARD_SPACING) + CARD_WIDTH / 2;
	const tiltAngle = isTopPlayer ? Math.PI / 2.2 : -Math.PI / 2.2;
	const yRotation = isTopPlayer ? Math.PI : 0;

	return (
		<group position={[xPos, 0, 0]}>
			<group rotation={[tiltAngle, yRotation, 0]}>
				<Card3D card={card} position={[0, 0, 0]} player={player} />
			</group>
		</group>
	);
};

export default Hand3D;