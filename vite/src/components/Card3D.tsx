import { animated, useSpring } from '@react-spring/three';
import { Text } from '@react-three/drei';
// ★修正点1: ThreeEventを@react-three/fiberからインポート
import type { ThreeEvent } from '@react-three/fiber';
import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { CardDefinition, PlayerId } from '../types/data';

// 親コンポーネントから渡される型に instanceId を含める
interface Card3DProps {
	card: CardDefinition & { instanceId: string };
	position: [number, number, number];
	player: PlayerId;
}

const Card3D: React.FC<Card3DProps> = ({ card, position, player }) => {
	const [isHovered, setIsHovered] = useState(false);
	const { selectCard, selectedCardId, activePlayerId } = useGameStore();

	// 選択判定は `instanceId` で行う
	const isSelected = selectedCardId === card.instanceId;
	const isMyTurn = activePlayerId === player;

	const springProps = useSpring({
		position: (isHovered && isMyTurn) || isSelected ? [position[0], position[1] + 0.5, position[2]] : position,
		scale: isSelected ? 1.1 : 1,
		config: { tension: 300, friction: 20 },
	});

	// ★修正点2: eventの型を `ThreeEvent` に修正
	const handleCardClick = (event: ThreeEvent<MouseEvent>) => {
		// この一行で、クリックイベントが背景のPlaneに伝播するのを防ぎます
		event.stopPropagation();

		if (!isMyTurn) return; // 自分のターンでなければ何もしない

		// カードの選択/解除も `instanceId` で行う
		selectCard(isSelected ? null : card.instanceId);
	};

	return (
		<animated.group
			position={springProps.position as any}
			scale={springProps.scale as any}
			onPointerEnter={(e) => { e.stopPropagation(); if (isMyTurn) setIsHovered(true); }} // ホバーイベントも伝播を停止
			onPointerLeave={(e) => { e.stopPropagation(); setIsHovered(false); }}
			onClick={handleCardClick} // ここで修正したハンドラを渡す
		>
			<mesh>
				<boxGeometry args={[1.5, 2.1, 0.05]} />
				<meshStandardMaterial color={isMyTurn ? '#2a2a2a' : '#1a1a1a'} />
			</mesh>
			<mesh>
				<boxGeometry args={[1.6, 2.2, 0.03]} />
				<meshStandardMaterial color={isSelected ? 'yellow' : 'white'} emissive={isSelected ? 'yellow' : 'black'} emissiveIntensity={0.5} />
			</mesh>
			<Text position={[0, 0.7, 0.03]} fontSize={0.15} color="white" anchorX="center" anchorY="middle">
				{card.name}
			</Text>
			<Text position={[0.6, 0.85, 0.03]} fontSize={0.12} color="white" anchorX="center" anchorY="middle">
				{`C:${card.cost}`}
			</Text>
		</animated.group>
	);
};

export default Card3D;