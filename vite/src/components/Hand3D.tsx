import { animated, to, useSpring } from '@react-spring/three';
import { Plane } from '@react-three/drei';
import { useGesture } from '@use-gesture/react';
import React, { useEffect, useMemo, useRef } from 'react';
import type { CardDefinition } from '../types/data';
import Card3D from './Card3D';

// CardDefinitionにinstanceIdプロパティを追加
type CardWithInstanceId = CardDefinition & { instanceId: string };

// 手札のレイアウトに関する定数
const CARD_WIDTH = 1.7;
const CARD_SPACING = 0.2;

/**
 * 1つの手札の描画と操作を管理するコンポーネント
 */
const Hand3D: React.FC<{
	player: 'native_side' | 'alien_side';
	cards: CardWithInstanceId[];
	isVisible: boolean;
}> = ({ player, cards, isVisible }) => {
	const isTopPlayer = player === 'native_side';

	const xOffsetRef = useRef(0);

	const [{ xOffset }, api] = useSpring(() => ({
		xOffset: 0,
		config: { mass: 1, tension: 500, friction: 40 },
	}));

	const movementBounds = useMemo(() => {
		const totalHandWidth = (cards.length * CARD_WIDTH) + (Math.max(0, cards.length - 1) * CARD_SPACING);
		const quantifiableWidth = totalHandWidth / 2 - CARD_WIDTH / 2;
		if (quantifiableWidth <= 0) return { min: 0, max: 0 };
		const max = quantifiableWidth * 100;
		const min = -max;
		return { min, max };
	}, [cards.length]);

	// ドラッグ操作のロジックを修正
	const bind = useGesture({
		// ドラッグ開始時に、現在の位置をmemoに記憶させる
		onDragStart: ({ memo }) => {
			memo = xOffsetRef.current;
			return memo;
		},
		// ドラッグ中は、記憶したmemoを基準に計算する
		onDrag: ({ down, movement: [mx], memo }) => {
			let newX = memo + mx;
			newX = Math.max(movementBounds.min, Math.min(newX, movementBounds.max));
			api.start({ xOffset: newX });
			if (!down) {
				xOffsetRef.current = newX;
			}
		},
	});

	// isVisibleの状態が変更されたときに、X座標を正しく制御する
	useEffect(() => {
		api.start({ xOffset: xOffsetRef.current });
	}, [isVisible, api]);


	const { z } = useSpring({
		z: isVisible ? 4 : 5.5,
		config: { tension: 200, friction: 20 },
	});

	const positionY = 2.2;

	return (
		<animated.group position={to([z], (zVal) => [0, positionY, isTopPlayer ? -zVal : zVal])}>
			<Plane
				{...bind()}
				args={[20, 4]}
				visible={false}
				rotation={[-Math.PI / 2, 0, 0]}
				position={[0, 0, 0.1]}
			/>
			<animated.group position-x={xOffset.to(x => x / 100)}>
				{cards.map((card, index) => (
					<CardInLine
						key={card.instanceId}
						card={card}
						index={index}
						total={cards.length}
						player={player}
						isTopPlayer={isTopPlayer}
					/>
				))}
			</animated.group>
		</animated.group>
	);
};

/**
 * カードを横一列に並べるコンポーネント
 */
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