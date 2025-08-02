import { animated, useSpring } from '@react-spring/three';
import { RoundedBox, Text, useTexture } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useDrag } from '@use-gesture/react';
import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import type { CardDefinition, PlayerId } from '../types/data';

// ★ このフラグで回転機能のON/OFFを切り替え
const IS_DEBUG_ROTATION_ENABLED = false;

// 親コンポーネントから渡される型に instanceId を含める
interface Card3DProps {
	card: CardDefinition & { instanceId: string };
	position: [number, number, number];
	player: PlayerId;
	width: number;
}


// 定数
const CARD_HEIGHT = 2.4;
const CARD_RADIUS = 0.04;
const CARD_DEPTH = 0.1;


const Card3D: React.FC<Card3DProps> = ({ card, position, player, width }) => {
	const CARD_WIDTH = width;
	const [isHovered, setIsHovered] = useState(false);
	const { selectCard, selectedCardId, activePlayerId, setNotification, playerStates } = useGameStore();


	const cooldownInfo = playerStates && playerStates.hasOwnProperty(player) && playerStates?.[player]?.cooldownActiveCards.find(c => c.cardId === card.id);
	const isCooldown = !!cooldownInfo;


	const isSelected = selectedCardId === card.instanceId;
	const isMyTurn = activePlayerId === player;
	const isPlayable = isMyTurn && !isCooldown;

	// ★ 修正: springにrotationを追加し、制御用のapiを取得
	const [springProps, api] = useSpring(() => {
		// 選択中またはホバー中のカードのY座標のオフセットを計算
		const hoverOffset = (isHovered && isPlayable) || isSelected ? 0.35 : 0;
		const targetY = (position?.[1] || 0) + hoverOffset;

		// 選択中のカードのスケールを計算
		const targetScale = isSelected ? 1.1 : 1;

		return {
			// 更新された位置とスケールを適用
			position: [position?.[0] || 0, targetY, position?.[2] || 0],
			scale: targetScale,
			rotation: [0, 0, 0],
			config: { tension: 300, friction: 20 },
		};
	});

	// ★ 追加: useDragでドラッグとクリックをまとめて処理
	const bind = useDrag(
		({ down, movement: [mx, my], tap, event }) => {
			event.stopPropagation();
			// タップ（クリック）時の処理
			if (tap) {
				handleCardClick(event as any);
				return;
			}

			// フラグがtrueの場合のみ回転処理を実行
			if (IS_DEBUG_ROTATION_ENABLED) {
				api.start({
					rotation: [my / 100, mx / 100, 0],
				});
			}
		},
		{ filterTaps: true }
	);

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
		const w = CARD_WIDTH * 0.9;
		const h = 0.48; // ヘッダーの高さ
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
			// ★ 修正: rotationプロパティとジェスチャーのbindを適用し、onClickを削除
			position={springProps.position as any}
			scale={springProps.scale as any}
			rotation={springProps.rotation as any}
			onPointerEnter={(e) => { e.stopPropagation(); if (isPlayable) setIsHovered(true); }}
			onPointerLeave={(e) => { e.stopPropagation(); setIsHovered(false); }}
			{...bind()}
		>
			{/* カードの縁（選択時に光る） */}
			<RoundedBox castShadow args={[CARD_WIDTH + 0.1, CARD_HEIGHT + 0.1, CARD_DEPTH - 0.02]} radius={CARD_RADIUS}>
				<meshStandardMaterial color={isSelected ? '#FFD700' : '#B8860B'} emissive={isSelected ? '#FFD700' : 'black'} emissiveIntensity={isSelected ? 0.5 : 0} />
			</RoundedBox>


			{/* カードの土台 */}
			<RoundedBox castShadow args={[CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH]} radius={CARD_RADIUS}>
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
				<Text position={[0, CARD_HEIGHT / 2 - 0.35, 0.01]} fontSize={0.14} fontWeight={"bold"} color="white" anchorX="center" anchorY="middle" maxWidth={CARD_WIDTH * 0.9}>
					{card.name}
				</Text>
				{/* コスト */}
				<group position={[CARD_WIDTH / 2 - 0.15, CARD_HEIGHT / 2 - 0.15, 0.0001]}>
					<mesh>
						<circleGeometry args={[0.12, 32]} />
						<meshBasicMaterial color="gold" />
					</mesh>
					<Text position={[0, 0, 0.01]} fontSize={0.16} color="black" anchorX="center" anchorY="middle">
						{card.cost}
					</Text>
				</group>
			</group>


			{/* 中央の画像エリア */}
			<mesh position={[0, 0.23, CARD_DEPTH / 2 + 0.003]}>
				<planeGeometry args={[CARD_WIDTH * 0.9, 0.8]} />
				<meshStandardMaterial map={imageTexture} />
			</mesh>


			{/* 説明欄 */}
			<group position={[0, -0.68, CARD_DEPTH / 2 + 0.0015]}>
				{/* 背景と枠線 */}
				<mesh>
					<planeGeometry args={[CARD_WIDTH * 0.9, 0.9]} />
					<meshBasicMaterial color="white" />
				</mesh>
				<mesh position={[0, 0, -0.001]}>
					<planeGeometry args={[CARD_WIDTH - 0.15, 0.95]} />
					<meshBasicMaterial color='#B8860B' />
				</mesh>


				{/* 説明テキスト */}
				<Text
					position={[0, 0.3, 0.01]} // y座標を調整
					fontSize={0.1}
					color="black"
					anchorX="center"
					anchorY="top" // 上揃えに変更
					maxWidth={CARD_WIDTH * 0.9} // maxWidthを広げる
					lineHeight={1.2} // 行間を設定
					whiteSpace="overflowWrap" // 改行と自動折り返しを有効にする
				>
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