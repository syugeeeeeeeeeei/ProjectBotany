import { animated, to, useSpring } from '@react-spring/three';
import { Plane } from '@react-three/drei';
import { useGesture } from '@use-gesture/react';
import React, { useEffect, useMemo, useRef } from 'react';
import type { CardDefinition } from '../types/data';
import Card3D from './Card3D';

// App.tsxから渡されるカードの型を定義
type CardWithInstanceId = CardDefinition & { instanceId: string };

// --- Propsの型定義 ---
// このコンポーネントが親(App.tsx)から受け取るデータの型を定義します
interface Hand3DProps {
	player: 'native_side' | 'alien_side';
	cards: CardWithInstanceId[];
	isVisible: boolean;
};

// --- 定数定義 ---
const CARD_WIDTH = 1.7;
const CARD_SPACING = 0.2;

// 【修正点】コンポーネント定義をReact.FC<Hand3DProps>に変更し、propsを正しく受け取る
const Hand3D: React.FC<Hand3DProps> = ({ player, cards, isVisible }) => {
	const isTopPlayer = player === 'native_side';

	// 最終的なX座標を永続的に保存するRef
	const xOffsetRef = useRef(0);
	// ドラッグ開始時のX座標を一時的に保存するRef
	const dragStartOffsetRef = useRef(0);

	const [{ xOffset }, api] = useSpring(() => ({
		xOffset: 0,
		config: { mass: 1, tension: 500, friction: 50 },
	}));

	const movementBounds = useMemo(() => {
		const totalHandWidth = (cards.length * CARD_WIDTH) + (Math.max(0, cards.length - 1) * CARD_SPACING);
		// 表示領域(ビューポート)の幅を適当に定義します（例: 8）
		const viewWidth = 8;
		if (totalHandWidth <= viewWidth) {
			return { min: 0, max: 0 };
		}
		const max = (totalHandWidth - viewWidth) / 2;
		const min = -max;

		return { min, max };
	}, [cards.length]);

	const bind = useGesture({
		onDrag: ({ down, movement: [mx], first }) => {
			if (first) {
				dragStartOffsetRef.current = xOffsetRef.current;
			}
			const newX = dragStartOffsetRef.current + mx;
			// 3D空間の単位に合わせるため、100で割るなどの調整は不要
			const clampedX = Math.max(movementBounds.min, Math.min(newX, movementBounds.max));
			api.start({ xOffset: clampedX, immediate: down });

			if (!down) {
				xOffsetRef.current = clampedX;
			}
		},
	});

	// isVisibleの状態が変わった時に、アニメーションAPIを現在のRef値で更新
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
			{/* 【修正点】xOffsetを直接position-xに適用 */}
			<animated.group position-x={xOffset}>
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

// --- 以下は内部コンポーネントのため変更なし ---

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
				{/* 【修正点】Card3Dに渡すpropsを `card` に統一 */}
				<Card3D card={card} position={[0, 0, 0]} player={player} />
			</group>
		</group>
	);
};

export default Hand3D;