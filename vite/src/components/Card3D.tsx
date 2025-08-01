import { animated, useSpring } from '@react-spring/three';
import { RoundedBox, Text, useTexture } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import type { CardDefinition, PlayerId } from '../types/data';

// ★ 追加: このフラグで回転機能のON/OFFを切り替え
const IS_DEBUG_ROTATION_ENABLED = true;

// 親コンポーネントから渡される型に instanceId を含める
interface Card3DProps {
	card: CardDefinition & { instanceId: string };
	position: [number, number, number];
	player: PlayerId;
}


// 定数
const CARD_WIDTH = 1.6;
const CARD_HEIGHT = 2.4;
const CARD_RADIUS = 0.08;
const CARD_DEPTH = 0.1;


const Card3D: React.FC<Card3DProps> = ({ card, position, player }) => {
	const [isHovered, setIsHovered] = useState(false);
	const { selectCard, selectedCardId, activePlayerId, setNotification, playerStates } = useGameStore();


	const cooldownInfo = playerStates && playerStates.hasOwnProperty(player) && playerStates?.[player]?.cooldownActiveCards.find(c => c.cardId === card.id);
	const isCooldown = !!cooldownInfo;


	const isSelected = selectedCardId === card.instanceId;
	const isMyTurn = activePlayerId === player;
	const isPlayable = isMyTurn && !isCooldown;


	const springProps = useSpring({
		position: (isHovered && isPlayable) || isSelected ? [position?.[0] || 0, (position?.[1] || 0) + 0.35, position?.[2] || 0] : [position?.[0] || 0, position?.[1] || 0, position?.[2] || 0],
		scale: isSelected ? 1.1 : 1,
		config: { tension: 300, friction: 20 },
	});


	// カードの画像テクスチャ
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


	// ヘッダーの色をカードタイプに応じて決定
	const headerColor = (() => {
		switch (card.cardType) {
			case 'alien': return '#A00000'; // 赤系
			case 'eradication': return '#005080'; // 青系
			case 'recovery': return '#207030'; // 緑系
			default: return '#555555';
		}
	})();


	// ヘッダーの波型形状を生成
	const headerShape = useMemo(() => {
		const shape = new THREE.Shape();
		const w = CARD_WIDTH;
		const h = 0.5; // ヘッダーの高さ
		const topY = CARD_HEIGHT / 2;


		shape.moveTo(-w / 2, topY - h);
		shape.lineTo(-w / 2, topY - 0.1);
		shape.bezierCurveTo(-w / 2, topY, -w / 3, topY + 0.05, -w / 6, topY);
		shape.bezierCurveTo(0, topY - 0.05, w / 6, topY, w / 2, topY - 0.1);
		shape.lineTo(w / 2, topY - h);
		shape.closePath();


		return shape;
	}, []);


	return (
		<animated.group
			position={springProps.position as any}
			scale={springProps.scale as any}
			onPointerEnter={(e) => { e.stopPropagation(); if (isPlayable) setIsHovered(true); }}
			onPointerLeave={(e) => { e.stopPropagation(); setIsHovered(false); }}
			onClick={handleCardClick}
		>
			{/* カードの縁（選択時に光る） */}
			<RoundedBox args={[CARD_WIDTH + 0.1, CARD_HEIGHT + 0.1, CARD_DEPTH - 0.02]} radius={CARD_RADIUS}>
				<meshStandardMaterial color={isSelected ? 'yellow' : '#FFFFFF'} emissive={isSelected ? 'yellow' : 'black'} emissiveIntensity={isSelected ? 0.5 : 0} />
			</RoundedBox>


			{/* カードの土台 */}
			<RoundedBox args={[CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH]} radius={CARD_RADIUS}>
				<meshStandardMaterial color="#F5EFE6" />
			</RoundedBox>


			{/* ヘッダー */}
			<group position={[0, 0, CARD_DEPTH / 2 + 0.001]}>
				{/* 背景 */}
				<mesh>
					<shapeGeometry args={[headerShape]} />
					<meshBasicMaterial color={headerColor} />
				</mesh>
				{/* カード名 */}
				<Text position={[0, CARD_HEIGHT / 2 - 0.28, 0.01]} fontSize={0.14} fontWeight={"bold"} color="white" anchorX="center" anchorY="middle" maxWidth={CARD_WIDTH * 0.9}>
					{card.name}
				</Text>
				{/* コスト */}
				<group position={[CARD_WIDTH / 2 - 0.1, CARD_HEIGHT / 2 - 0.1, 0.002]}>
					<mesh>
						<circleGeometry args={[0.15, 32]} />
						<meshBasicMaterial color="gold" />
					</mesh>
					<Text position={[0, 0, 0.01]} fontSize={0.2} color="black" anchorX="center" anchorY="middle">
						{card.cost}
					</Text>
				</group>
			</group>


			{/* 中央の画像エリア */}
			<mesh position={[0, 0.24, CARD_DEPTH / 2 + 0.001]}>
				<planeGeometry args={[CARD_WIDTH - 0.2, 0.9]} />
				<meshStandardMaterial map={imageTexture} />
			</mesh>


			{/* 説明欄 */}
			<group position={[0, -0.7, CARD_DEPTH / 2 + 0.001]}>
				{/* 背景と枠線 */}
				<mesh>
					<planeGeometry args={[CARD_WIDTH - 0.2, 0.9]} />
					<meshBasicMaterial color="white" />
				</mesh>
				<mesh position={[0, 0, -0.001]}>
					<planeGeometry args={[CARD_WIDTH - 0.15, 0.95]} />
					<meshBasicMaterial color="orange" />
				</mesh>


				{/* 説明テキスト */}
				<Text position={[0, 0.05, 0.01]} fontSize={0.1} color="black" anchorX="center" anchorY="middle" maxWidth={CARD_WIDTH * 0.8}>
					{card.description}
				</Text>
			</group>




			{/* クールダウン表示 */}
			{isCooldown && (
				<group>
					<mesh position={[0, 0, CARD_DEPTH / 2 + 0.01]}>
						<planeGeometry args={[CARD_WIDTH + 0.1, CARD_HEIGHT + 0.1]} />
						<meshBasicMaterial color="gray" transparent opacity={0.6} />
					</mesh>
					<Text position={[0, 0, CARD_DEPTH / 2 + 0.02]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
						{cooldownInfo.turnsRemaining}
					</Text>
				</group>
			)}
		</animated.group>
	);
};


export default Card3D;