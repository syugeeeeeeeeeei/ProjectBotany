import { animated, to, useSpring } from '@react-spring/three';
import { useGesture } from '@use-gesture/react';
import React from 'react';
import { useGameStore } from '../store/gameStore';
import type { CardDefinition } from '../types/data';
import Card3D from './Card3D';

// メインコンポーネント：両プレイヤーの手札を生成する
const PlayerHand3D: React.FC<{ cards: CardDefinition[] }> = ({ cards }) => {
	return (
		<>
			<Hand player="alien_side" cards={cards} />
			<Hand player="native_side" cards={cards} />
		</>
	);
};

// 各プレイヤーの手札コンテナと横スライドロジック
const Hand: React.FC<{ player: 'native_side' | 'alien_side'; cards: CardDefinition[] }> = ({ player, cards }) => {
	const { isHandVisible } = useGameStore();
	const isTopPlayer = player === 'native_side';

	const [{ xOffset }, api] = useSpring(() => ({ xOffset: 0, config: { tension: 300, friction: 30 } }));

	useGesture({
		onDrag: ({ event, movement: [mx], first, memo }) => {
			if (!(event instanceof PointerEvent)) return memo;

			const y = event.clientY;
			const isTopHalf = y < window.innerHeight / 2;

			if (isTopPlayer !== isTopHalf) return memo;

			if (first) {
				memo = xOffset.get();
			}
			api.start({ xOffset: memo + mx });
			return memo;
		},
	}, {
		target: window,
		eventOptions: { passive: false }
	});

	// ✨ --- Y座標を固定し、Z座標でHide/Showを実装 ---
	const { z } = useSpring({
		z: isHandVisible ? 6.5 : 5.5, // Show: 6.5, Hide: 5.5
		config: { tension: 200, friction: 20 },
	});

	const positionY = 1.2; // Y座標は常にこの値に固定

	return (
		// ✨ `to`インターポレーターを使ってpositionを正しく設定
		<animated.group position={to([z], (zVal) => [0, positionY, isTopPlayer ? -zVal : zVal])}>
			<animated.group position-x={xOffset.to(x => x / 100)}>
				{cards.map((card, index) => (
					<CardInLine
						key={`${player}-${card.id}`}
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

// カードを横一列に配置するためのコンポーネント
const CardInLine: React.FC<{ card: CardDefinition, index: number, total: number, player: 'native_side' | 'alien_side', isTopPlayer: boolean }> =
	({ card, index, total, player, isTopPlayer }) => {

		const cardWidth = 1.7;
		const spacing = 0.2;

		const totalWidth = (total * cardWidth) + ((total - 1) * spacing);
		const startX = -totalWidth / 2;

		const xPos = startX + index * (cardWidth + spacing) + cardWidth / 2;

		const tiltAngle = -Math.PI / 2;

		return (
			<group position={[xPos, 0, 0]}>
				<group rotation={[tiltAngle, isTopPlayer ? Math.PI : 0, 0]}>
					<Card3D card={card} position={[0, 0, 0]} player={player} />
				</group>
			</group>
		);
	};

export default PlayerHand3D;