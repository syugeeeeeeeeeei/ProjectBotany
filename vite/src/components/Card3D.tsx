import { animated, useSpring } from '@react-spring/three';
import { RoundedBox, Text, useTexture } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import type { CardDefinition, PlayerId } from '../types/data';

// --- 定数定義 ---

/**
 * カードコンポーネントのレイアウトに関する静的な値を集約したオブジェクト。
 * サイズ、角の丸み、各レイヤーの深度（Z座標）などを定義する。
 */
const CARD_LAYOUT = {
	HEIGHT: 2.4,                  // カードの高さ
	RADIUS: 0.04,                 // カードの角の丸み
	BASE_DEPTH: 0.1,              // カードの基本的な厚み
	// 各レイヤーの深度（Z座標）を定義
	LAYER_DEPTHS: {
		BORDER: 0.1 - 0.02,             // 縁取り
		BASE: 0.1,                      // ベース
		HEADER: 0.1 / 2 + 0.001,        // ヘッダー
		IMAGE: 0.1 / 2 + 0.003,         // 画像
		DESCRIPTION: 0.1 / 2 + 0.0015,  // 説明文
		COOLDOWN_OVERLAY: 0.1 / 2 + 0.01, // クールダウン表示のオーバーレイ
		COOLDOWN_TEXT: 0.1 / 2 + 0.02,    // クールダウン表示のテキスト
	},
	// ヘッダー部分のレイアウト
	HEADER: {
		HEIGHT: 0.48,
		TOP_Y_OFFSET: 0.05,
		BEZIER_CONTROL_X_RATIO: 1 / 3,
		BEZIER_TANGENT_X_RATIO: 1 / 6,
	},
	// コスト表示の円
	COST_CIRCLE: {
		RADIUS: 0.13,
		X_OFFSET_RATIO: 0.5,
		Y_OFFSET: 0.15,
		TEXT_FONT_SIZE: 0.16,
	},
	// 画像部分のレイアウト
	IMAGE_AREA: {
		Y_POSITION: 0.23,
		HEIGHT: 0.8,
	},
	// 説明文部分のレイアウト
	DESCRIPTION_AREA: {
		Y_POSITION: -0.68,
		HEIGHT: 0.9,
		BG_HEIGHT: 0.95,
		TEXT_Y_OFFSET: 0.4,
		TEXT_FONT_SIZE: 0.1,
		LINE_HEIGHT: 1.2,
	},
	// カード名のテキスト
	NAME_TEXT: {
		Y_OFFSET_RATIO: 0.5,
		Y_OFFSET_FIXED: 0.35,
		FONT_SIZE: 0.14,
	}
};

// --- Propsの型定義 ---

interface Card3DProps {
	card: CardDefinition & { instanceId: string };
	position: [number, number, number];
	player: PlayerId;
	width: number;
	opacity: any; // react-springからの継承のためany
}


/**
 * 3D空間に表示される1枚のカードコンポーネント。
 * カード情報に基づき、見た目やインタラクションを管理する。
 * @param {Card3DProps} props - カードの情報、位置、プレイヤーIDなど。
 */
const Card3D: React.FC<Card3DProps> = ({ card, position, player, width, opacity }) => {
	// --- StateとStore ---
	const [isHovered, setIsHovered] = useState(false);
	const { selectCard, selectedCardId, activePlayerId, setNotification, playerStates } = useGameStore();

	// --- 変数とロジック ---
	const CARD_WIDTH = width;
	const cooldownInfo = playerStates?.[player]?.cooldownActiveCards.find(c => c.cardId === card.id);
	const isCooldown = !!cooldownInfo;
	const isSelected = selectedCardId === card.instanceId;
	const isMyTurn = activePlayerId === player;
	const isPlayable = isMyTurn && !isCooldown;

	// --- アニメーション ---
	const { scale } = useSpring({
		scale: isSelected ? 1.1 : 1,
		config: { tension: 300, friction: 30 },
	});

	// --- テクスチャ ---
	// TODO: カードごとの画像パスを動的に読み込むようにする
	const imageTexture = useTexture('https://placehold.co/100x60');

	// --- イベントハンドラ ---
	/**
	 * カードクリック時の処理。
	 * 自分のターンで、かつクールダウン中でなければカード選択状態をトグルする。
	 * プレイ不可能な場合は通知を表示する。
	 */
	const handleCardClick = (event: ThreeEvent<MouseEvent>) => {
		event.stopPropagation(); // 親要素へのイベント伝播を阻止

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

	// --- メモ化された値 ---
	/** カード種別に応じたヘッダー色を決定する */
	const headerColor = useMemo(() => {
		switch (card.cardType) {
			case 'alien': return '#A00000';
			case 'eradication': return '#005080';
			case 'recovery': return '#207030';
			default: return '#555555';
		}
	}, [card.cardType]);

	/** ヘッダー部分のカスタムシェイプを生成する */
	const headerShape = useMemo(() => {
		const shape = new THREE.Shape();
		const w = CARD_WIDTH * 0.9;
		const h = CARD_LAYOUT.HEADER.HEIGHT;
		const topY = CARD_LAYOUT.HEIGHT / 2 - CARD_LAYOUT.HEADER.TOP_Y_OFFSET;

		shape.moveTo(-w / 2, topY - h);
		shape.lineTo(-w / 2, topY - 0.1);
		shape.bezierCurveTo(-w / 2, topY, -w * CARD_LAYOUT.HEADER.BEZIER_CONTROL_X_RATIO, topY + 0.05, -w * CARD_LAYOUT.HEADER.BEZIER_TANGENT_X_RATIO, topY);
		shape.bezierCurveTo(0, topY - 0.05, w * CARD_LAYOUT.HEADER.BEZIER_TANGENT_X_RATIO, topY, w / 2, topY - 0.1);
		shape.lineTo(w / 2, topY - h);
		shape.closePath();

		return shape;
	}, [CARD_WIDTH]);

	// --- レンダリング ---
	return (
		<animated.group
			scale={scale}
			onPointerEnter={(e) => { e.stopPropagation(); if (isPlayable) setIsHovered(true); }}
			onPointerLeave={(e) => { e.stopPropagation(); setIsHovered(false); }}
			onClick={handleCardClick}
		>
			{/* カードの縁取り */}
			<RoundedBox castShadow args={[CARD_WIDTH + 0.1, CARD_LAYOUT.HEIGHT + 0.1, CARD_LAYOUT.LAYER_DEPTHS.BORDER]} radius={CARD_LAYOUT.RADIUS}>
				<animated.meshStandardMaterial color={isSelected ? '#FFD700' : '#B8860B'} emissive={isSelected ? '#FFD700' : 'black'} emissiveIntensity={isSelected ? 0.5 : 0} transparent opacity={opacity} />
			</RoundedBox>

			{/* カードのベース */}
			<RoundedBox castShadow args={[CARD_WIDTH, CARD_LAYOUT.HEIGHT, CARD_LAYOUT.LAYER_DEPTHS.BASE]} radius={CARD_LAYOUT.RADIUS}>
				<animated.meshStandardMaterial color="#F5EFE6" transparent opacity={opacity} />
			</RoundedBox>

			{/* ヘッダーセクション */}
			<group position={[0, 0, CARD_LAYOUT.LAYER_DEPTHS.HEADER]}>
				{/* ヘッダー背景 */}
				<mesh>
					<shapeGeometry args={[headerShape]} />
					<animated.meshBasicMaterial color={headerColor} transparent opacity={opacity} />
				</mesh>
				{/* カード名 */}
				<Text
					position={[0, CARD_LAYOUT.HEIGHT * CARD_LAYOUT.NAME_TEXT.Y_OFFSET_RATIO - CARD_LAYOUT.NAME_TEXT.Y_OFFSET_FIXED, 0.01]}
					fontSize={CARD_LAYOUT.NAME_TEXT.FONT_SIZE}
					fontWeight={"bold"}
					color="white"
					font='MPLUS1p-Bold.ttf'
					anchorX="center"
					anchorY="middle"
					maxWidth={CARD_WIDTH * 0.9}
				>
					{card.name}
				</Text>
				{/* コスト表示 */}
				<group position={[CARD_WIDTH * CARD_LAYOUT.COST_CIRCLE.X_OFFSET_RATIO - CARD_LAYOUT.COST_CIRCLE.Y_OFFSET, CARD_LAYOUT.HEIGHT / 2 - CARD_LAYOUT.COST_CIRCLE.Y_OFFSET, 0.0001]}>
					<mesh>
						<circleGeometry args={[CARD_LAYOUT.COST_CIRCLE.RADIUS, 32]} />
						<animated.meshBasicMaterial color='#B8860B' opacity={opacity} />
					</mesh>
					<Text
						position={[0, 0, 0.01]}
						fontSize={CARD_LAYOUT.COST_CIRCLE.TEXT_FONT_SIZE}
						color="black"
						font='MPLUS1p-Bold.ttf'
						fontWeight="bold"
						anchorX="center"
						anchorY="middle"
					>
						{card.cost}
					</Text>
				</group>
			</group>

			{/* 画像セクション */}
			<animated.mesh position={[0, CARD_LAYOUT.IMAGE_AREA.Y_POSITION, CARD_LAYOUT.LAYER_DEPTHS.IMAGE]}>
				<planeGeometry args={[CARD_WIDTH * 0.9, CARD_LAYOUT.IMAGE_AREA.HEIGHT]} />
				<meshStandardMaterial map={imageTexture} opacity={opacity} />
			</animated.mesh>

			{/* 説明文セクション */}
			<group position={[0, CARD_LAYOUT.DESCRIPTION_AREA.Y_POSITION, CARD_LAYOUT.LAYER_DEPTHS.DESCRIPTION]}>
				{/* 説明文の背景 */}
				<mesh>
					<planeGeometry args={[CARD_WIDTH * 0.9, CARD_LAYOUT.DESCRIPTION_AREA.HEIGHT]} />
					<animated.meshBasicMaterial color="white" transparent opacity={opacity} />
				</mesh>
				{/* 説明文背景の縁取り */}
				<mesh position={[0, 0, -0.001]}>
					<planeGeometry args={[CARD_WIDTH - 0.15, CARD_LAYOUT.DESCRIPTION_AREA.BG_HEIGHT]} />
					<animated.meshBasicMaterial color='#B8860B' transparent opacity={opacity} />
				</mesh>
				{/* 説明文テキスト */}
				<Text
					position={[0, CARD_LAYOUT.DESCRIPTION_AREA.TEXT_Y_OFFSET, 0.01]}
					fontSize={CARD_LAYOUT.DESCRIPTION_AREA.TEXT_FONT_SIZE}
					font='MPLUS1p-Regular.ttf'
					color="black"
					anchorX="center"
					anchorY="top"
					maxWidth={CARD_WIDTH * 0.8}
					lineHeight={CARD_LAYOUT.DESCRIPTION_AREA.LINE_HEIGHT}
					overflowWrap='break-word'
				>
					{card.description}
				</Text>
			</group>

			{/* クールダウン表示 */}
			{isCooldown && (
				<group>
					<mesh position={[0, 0, CARD_LAYOUT.LAYER_DEPTHS.COOLDOWN_OVERLAY]}>
						<planeGeometry args={[CARD_WIDTH + 0.1, CARD_LAYOUT.HEIGHT + 0.1]} />
						<meshBasicMaterial color="gray" transparent opacity={0.6} />
					</mesh>
					<Text
						position={[0, 0, CARD_LAYOUT.LAYER_DEPTHS.COOLDOWN_TEXT]}
						font='MPLUS1p-Bold.ttf'
						fontSize={0.5}
						color="white"
						anchorX="center"
						anchorY="middle"
					>
						{cooldownInfo.turnsRemaining}
					</Text>
				</group>
			)}
		</animated.group>
	);
};

export default Card3D;