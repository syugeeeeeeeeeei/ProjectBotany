import { animated, useSpring } from '@react-spring/three';
import { Text } from '@react-three/drei';
import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { CardDefinition } from '../types/data';

interface Card3DProps {
	card: CardDefinition;
	position: [number, number, number];
	player: 'native_side' | 'alien_side'; // ✨ どちらのプレイヤーのカードかを受け取る
}

const Card3D: React.FC<Card3DProps> = ({ card, position, player }) => {
	const [isHovered, setIsHovered] = useState(false);
	const { selectCard, selectedCardId, activePlayerId } = useGameStore();

	const isSelected = selectedCardId === card.id;
	const isMyTurn = activePlayerId === player; // ✨ 自分のターンか判定

	const springProps = useSpring({
		position: (isHovered && isMyTurn) || isSelected ? [position[0], position[1] + 0.5, position[2]] : position,
		scale: isSelected ? 1.1 : 1,
		config: { tension: 300, friction: 20 },
	});

	const handleCardClick = () => {
		if (!isMyTurn) return; // 自分のターンでなければ何もしない
		selectCard(isSelected ? null : card.id);
	};

	return (
		<animated.group
			position={springProps.position as any}
			scale={springProps.scale as any}
			onPointerEnter={() => isMyTurn && setIsHovered(true)} // ✨ 自分のターン中のみホバー
			onPointerLeave={() => setIsHovered(false)}
			onClick={handleCardClick}
		>
			<mesh>
				<boxGeometry args={[1.5, 2.1, 0.05]} />
				{/* ✨ 相手のターン中は少し暗くする */}
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