import { animated, useSpring } from '@react-spring/three';
import { RoundedBox, Text, useTexture } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import type { CardDefinition, PlayerId } from '../types/data';

// --- 定数定義 ---

const CARD_HEIGHT = 2.4;
const CARD_RADIUS = 0.04;
const CARD_BASE_DEPTH = 0.1;

const CARD_LAYER_DEPTHS = {
	BORDER: CARD_BASE_DEPTH - 0.02,
	BASE: CARD_BASE_DEPTH,
	HEADER: CARD_BASE_DEPTH / 2 + 0.001,
	IMAGE: CARD_BASE_DEPTH / 2 + 0.003,
	DESCRIPTION: CARD_BASE_DEPTH / 2 + 0.0015,
	COOLDOWN_OVERLAY: CARD_BASE_DEPTH / 2 + 0.01,
	COOLDOWN_TEXT: CARD_BASE_DEPTH / 2 + 0.02,
};


interface Card3DProps {
	card: CardDefinition & { instanceId: string };
	position: [number, number, number];
	player: PlayerId;
	width: number;
	opacity: any;
}


const Card3D: React.FC<Card3DProps> = ({ card, position, player, width, opacity }) => {
	const CARD_WIDTH = width;
	const [isHovered, setIsHovered] = useState(false);
	const { selectCard, selectedCardId, activePlayerId, setNotification, playerStates } = useGameStore();

	const cooldownInfo = playerStates?.[player]?.cooldownActiveCards.find(c => c.cardId === card.id);
	const isCooldown = !!cooldownInfo;

	const isSelected = selectedCardId === card.instanceId;
	const isMyTurn = activePlayerId === player;
	const isPlayable = isMyTurn && !isCooldown;

	const { scale } = useSpring({
		scale: isSelected ? 1.1 : 1,
		config: { tension: 300, friction: 30 },
	});

	const imageTexture = useTexture('https://placehold.co/100x60');

	const handleCardClick = (event: ThreeEvent<MouseEvent>) => {
		event.stopPropagation();

		if (!isMyTurn) {
			setNotification("相手のターンです", player);
			return;
		}

		if (isCooldown) {
			setNotification(`このカードはあと${cooldownInfo.turnsRemaining}ターン使用できません。`, player);
			return;
		}

		selectCard(isSelected ? null : card.instanceId);
	};

	const headerColor = useMemo(() => {
		switch (card.cardType) {
			case 'alien': return '#A00000';
			case 'eradication': return '#005080';
			case 'recovery': return '#207030';
			default: return '#555555';
		}
	}, [card.cardType]);

	const headerShape = useMemo(() => {
		const shape = new THREE.Shape();
		const w = CARD_WIDTH * 0.9;
		const h = 0.48;
		const topY = CARD_HEIGHT / 2 - 0.05;

		shape.moveTo(-w / 2, topY - h);
		shape.lineTo(-w / 2, topY - 0.1);
		shape.bezierCurveTo(-w / 2, topY, -w / 3, topY + 0.05, -w / 6, topY);
		shape.bezierCurveTo(0, topY - 0.05, w / 6, topY, w / 2, topY - 0.1);
		shape.lineTo(w / 2, topY - h);
		shape.closePath();

		return shape;
	}, [CARD_WIDTH]);

	return (
		<animated.group
			scale={scale}
			onPointerEnter={(e) => { e.stopPropagation(); if (isPlayable) setIsHovered(true); }}
			onPointerLeave={(e) => { e.stopPropagation(); setIsHovered(false); }}
			onClick={handleCardClick}
		>
			<RoundedBox castShadow args={[CARD_WIDTH + 0.1, CARD_HEIGHT + 0.1, CARD_LAYER_DEPTHS.BORDER]} radius={CARD_RADIUS}>
				<animated.meshStandardMaterial color={isSelected ? '#FFD700' : '#B8860B'} emissive={isSelected ? '#FFD700' : 'black'} emissiveIntensity={isSelected ? 0.5 : 0} transparent opacity={opacity} />
			</RoundedBox>

			<RoundedBox castShadow args={[CARD_WIDTH, CARD_HEIGHT, CARD_LAYER_DEPTHS.BASE]} radius={CARD_RADIUS}>
				<animated.meshStandardMaterial color="#F5EFE6" transparent opacity={opacity} />
			</RoundedBox>

			<group position={[0, 0, CARD_LAYER_DEPTHS.HEADER]}>
				<mesh>
					<shapeGeometry args={[headerShape]} />
					<animated.meshBasicMaterial color={headerColor} transparent opacity={opacity} />
				</mesh>
				{/* ★修正: Textから透明度関連のpropをすべて削除 */}
				<Text
					position={[0, CARD_HEIGHT / 2 - 0.35, 0.01]}
					fontSize={0.14}
					fontWeight={"bold"}
					color="white"
					anchorX="center"
					anchorY="middle"
					maxWidth={CARD_WIDTH * 0.9}
				>
					{card.name}
				</Text>
				<group position={[CARD_WIDTH / 2 - 0.15, CARD_HEIGHT / 2 - 0.15, 0.0001]}>
					<mesh>
						<circleGeometry args={[0.13, 32]} />
						<animated.meshBasicMaterial color='#B8860B' opacity={opacity} />
					</mesh>
					<Text
						position={[0, 0, 0.01]}
						fontSize={0.16}
						color="black"
						fontWeight="bold"
						anchorX="center"
						anchorY="middle"
					>
						{card.cost}
					</Text>
				</group>
			</group>

			<mesh position={[0, 0.23, CARD_LAYER_DEPTHS.IMAGE]}>
				<planeGeometry args={[CARD_WIDTH * 0.9, 0.8]} />
				<animated.meshStandardMaterial map={imageTexture} opacity={opacity} />
			</mesh>

			<group position={[0, -0.68, CARD_LAYER_DEPTHS.DESCRIPTION]}>
				<mesh>
					<planeGeometry args={[CARD_WIDTH * 0.9, 0.9]} />
					<animated.meshBasicMaterial color="white" transparent opacity={opacity} />
				</mesh>
				<mesh position={[0, 0, -0.001]}>
					<planeGeometry args={[CARD_WIDTH - 0.15, 0.95]} />
					<animated.meshBasicMaterial color='#B8860B' transparent opacity={opacity} />
				</mesh>
				<Text
					position={[0, 0.3, 0.01]}
					fontSize={0.1}
					color="black"
					anchorX="center"
					anchorY="top"
					maxWidth={CARD_WIDTH * 0.9}
					lineHeight={1.2}
					whiteSpace="overflowWrap"
				>
					{card.description}
				</Text>
			</group>

			{isCooldown && (
				<group>
					<mesh position={[0, 0, CARD_LAYER_DEPTHS.COOLDOWN_OVERLAY]}>
						<planeGeometry args={[CARD_WIDTH + 0.1, CARD_HEIGHT + 0.1]} />
						<meshBasicMaterial color="gray" transparent opacity={0.6} />
					</mesh>
					<Text position={[0, 0, CARD_LAYER_DEPTHS.COOLDOWN_TEXT]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
						{cooldownInfo.turnsRemaining}
					</Text>
				</group>
			)}
		</animated.group>
	);
};

export default Card3D;