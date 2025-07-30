import { animated, useSpring } from '@react-spring/three';
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

// 各プレイヤーの手札コンテナと回転ロジック
const Hand: React.FC<{ player: 'native_side' | 'alien_side'; cards: CardDefinition[] }> = ({ player, cards }) => {
	const { isHandVisible } = useGameStore();
	const isTopPlayer = player === 'native_side';

	const [{ rotation }, api] = useSpring(() => ({ rotation: 0, config: { tension: 300, friction: 30 } }));

	// ✨ useGestureのロジックを、より安全な方法に刷新
	useGesture({
		onDrag: ({ event, movement: [mx], first, memo = rotation.get() }) => {
			// PointerEventはマウスとタッチを統合した新しいAPI
			if (!(event instanceof PointerEvent)) return memo;

			const y = event.clientY;
			const isTopHalf = y < window.innerHeight / 2;

			// この手札が担当する画面半分でのドラッグでなければ、値を更新せずにmemoを返す
			if (isTopPlayer !== isTopHalf) {
				// ドラッグが領域外から始まっても、最初の位置を記憶させる
				if (first) return rotation.get();
				return memo;
			}

			// ドラッグ開始時の角度を記憶
			const newMemo = first ? rotation.get() : memo;

			// 記憶した角度に現在の移動量を加えて更新
			api.start({ rotation: newMemo + mx * 0.5 });
			return newMemo;
		},
	}, {
		target: window,
		eventOptions: { passive: false }
	});

	const { y } = useSpring({
		y: isHandVisible ? 1 : -2,
		config: { tension: 200, friction: 20 },
	});

	const positionZ = isTopPlayer ? -6.5 : 6.5;

	return (
		<animated.group position={[0, y.get(), positionZ]}>
			<animated.group rotation-y={rotation.to(r => r * Math.PI / 180)}>
				{cards.map((card, index) => (
					<CardInFan
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

// カードを扇状に配置するためのコンポーネント
const CardInFan: React.FC<{ card: CardDefinition, index: number, total: number, player: 'native_side' | 'alien_side', isTopPlayer: boolean }> =
	({ card, index, total, player, isTopPlayer }) => {
		const fanAngle = 60;
		const anglePerCard = total > 1 ? fanAngle / (total - 1) : 0;
		const cardAngle = (index - (total - 1) / 2) * anglePerCard;
		const radius = 4.5;
		const tiltAngle = Math.PI / 4;

		return (
			<group rotation={[0, cardAngle * Math.PI / 180, 0]}>
				<group position={[0, 0, radius]}>
					<group rotation={[isTopPlayer ? tiltAngle : -tiltAngle, isTopPlayer ? Math.PI : 0, 0]}>
						<Card3D card={card} position={[0, 0, 0]} player={player} />
					</group>
				</group>
			</group>
		);
	};

export default PlayerHand3D;