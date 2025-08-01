import { animated, useSpring } from '@react-spring/three';
import { Text } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore'; // ★UIストアをインポート
import type { CardMaster, PlayerId } from '../types/data';

interface Card3DProps {
	card: CardMaster;
	position: [number, number, number];
	player: PlayerId;
}

const Card3D: React.FC<Card3DProps> = ({ card, position, player }) => {
	const [isHovered, setIsHovered] = useState(false);
	const { currentPlayerId, gameStatus } = useGameStore();
	// ★UIストアから状態とアクションを取得
	const { selectedCardId, selectCard } = useUIStore();

	const isSelected = selectedCardId === card.id;
	const isMyTurn = currentPlayerId === player && gameStatus === 'player_turn';

	const springProps = useSpring({
		position:
			(isHovered && isMyTurn) || isSelected
				? ([position[0], position[1] + 0.35, position[2]] as const)
				: position,
		scale: isSelected ? 1.1 : 1,
		config: { tension: 300, friction: 20 },
	});

	const handleCardClick = (event: ThreeEvent<MouseEvent>) => {
		event.stopPropagation();
		if (!isMyTurn) return;
		selectCard(isSelected ? null : card.id);
	};

	return (
		<animated.group
			position={springProps.position as any}
			scale={springProps.scale as any}
			onPointerEnter={(e) => {
				e.stopPropagation();
				if (isMyTurn) setIsHovered(true);
			}}
			onPointerLeave={(e) => {
				e.stopPropagation();
				setIsHovered(false);
			}}
			onClick={handleCardClick}
		>
			<mesh>
				<boxGeometry args={[1.5, 2.1, 0.05]} />
				<meshStandardMaterial color={isMyTurn ? '#2a2a2a' : '#1a1a1a'} />
			</mesh>
			<mesh>
				<boxGeometry args={[1.6, 2.2, 0.03]} />
				<meshStandardMaterial
					color={isSelected ? 'yellow' : 'white'}
					emissive={isSelected ? 'yellow' : 'black'}
					emissiveIntensity={0.5}
				/>
			</mesh>
			<Text
				position={[0, 0.7, 0.03]}
				fontSize={0.15}
				color="white"
				anchorX="center"
				anchorY="middle"
			>
				{card.name}
			</Text>
			<Text
				position={[0.6, 0.85, 0.03]}
				fontSize={0.12}
				color="white"
				anchorX="center"
				anchorY="middle"
			>
				{`C:${card.cost}`}
			</Text>
		</animated.group>
	);
};

export default Card3D;