import { animated, to, useSpring } from '@react-spring/three';
import { Plane } from '@react-three/drei';
import { useGesture } from '@use-gesture/react';
import React, { useEffect, useMemo, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import type { CardDefinition, PlayerId } from '../types/data';
import Card3D from './Card3D';
import type { DebugSettings } from './DebugDialog';

// --- 型定義 ---

type CardWithInstanceId = CardDefinition & { instanceId: string };

interface Hand3DProps {
	player: PlayerId;
	cards: CardWithInstanceId[];
	isVisible: boolean;
	onVisibilityChange: (visible: boolean) => void;
	currentPage: number;
	onPageChange: (page: number) => void;
	debugSettings: DebugSettings;
	isInteractionLocked: boolean;
};

// --- 定数定義 ---

/** 手札のレイアウトに関する設定値 */
const HAND_LAYOUT = {
	CARDS_PER_PAGE: 3,        // 1ページあたりのカード枚数
	CARD_WIDTH: 1.8,          // カードの幅
	CARD_SPACING: 0.8,        // カード間のスペース
	get PAGE_WIDTH() {        // 1ページあたりの合計幅（カード+スペース）
		return (this.CARDS_PER_PAGE * this.CARD_WIDTH) + ((this.CARDS_PER_PAGE - 1) * this.CARD_SPACING);
	},
	PAGE_TRANSITION_SPACING: 1, // ページ切り替え時の追加スペース
	POSITION_Y: 2.2,          // 手札全体のY座標
	// 手札の表示/非表示時のZ座標
	Z_POSITIONS: {
		VISIBLE: 3.5,
		HIDDEN: 6,
	},
	// カードの傾き角度
	TILT_ANGLES: {
		TOP_PLAYER: Math.PI / 2.2,
		BOTTOM_PLAYER: -Math.PI / 2.2,
	},
	// カードのY軸回転
	Y_ROTATIONS: {
		TOP_PLAYER: Math.PI,
		BOTTOM_PLAYER: 0,
	},
	CARD_SCALE: 1.25,          // カードの表示スケール
	// ジェスチャーを受け取るPlaneの設定
	GESTURE_PLANE: {
		WIDTH_PADDING: 4,          // 幅の追加分
		ROTATION_X: -Math.PI / 2,  // X軸回転
		POSITION_Y: -0.2,          // Y座標
		POSITION_Z: 0.1,           // Z座標
	},
	// CardInLineコンポーネントのアニメーション設定
	CARD_IN_LINE_ANIMATION: {
		Z_POS_SELECTED: -0.5,        // 選択されたカードのZ座標
		Z_POS_DEFAULT: 0,            // デフォルトのZ座標
		OPACITY_VISIBLE: 1,          // 表示時の不透明度
		OPACITY_HIDDEN: 0.5,         // 非表示時の不透明度（選択されていないカード）
		SPRING_CONFIG: { tension: 300, friction: 20 } // アニメーションの物理設定
	},
};

/** ジェスチャー操作に関する設定値 */
const GESTURE_SETTINGS = {
	FLICK_DISTANCE_THRESHOLD: 30, // フリックと判定される最小移動距離
	DRAG_THRESHOLD: 10,           // ドラッグ開始と判定される最小移動距離
};

/**
 * プレイヤーの手札を3D空間に表示するコンポーネント。
 * カードのページング、表示/非表示の切り替え、ジェスチャー操作を管理する。
 */
const Hand3D: React.FC<Hand3DProps> = ({
	player,
	cards,
	isVisible,
	onVisibilityChange,
	currentPage,
	onPageChange,
	debugSettings,
	isInteractionLocked
}) => {
	// --- StateとStore ---
	const { isGestureAreaVisible, flickVelocityThreshold, swipeAreaHeight } = debugSettings;
	const { selectCard, selectedCardId } = useGameStore();

	// --- 変数とロジック ---
	const isTopPlayer = player === 'native_side';
	const maxPage = Math.ceil(cards.length / HAND_LAYOUT.CARDS_PER_PAGE) - 1;

	// isVisibleの最新値をrefに保持し、useGestureのコールバック内で使用する
	const isVisibleRef = useRef(isVisible);
	useEffect(() => {
		isVisibleRef.current = isVisible;
	}, [isVisible]);

	// --- アニメーション ---
	// ページ切り替え時のX座標アニメーション
	const { x } = useSpring({
		x: -currentPage * (HAND_LAYOUT.PAGE_WIDTH + HAND_LAYOUT.PAGE_TRANSITION_SPACING),
		config: { tension: 300, friction: 30 },
	});

	// 手札の表示/非表示時のZ座標アニメーション
	const { z } = useSpring({
		z: isVisible ? HAND_LAYOUT.Z_POSITIONS.VISIBLE : HAND_LAYOUT.Z_POSITIONS.HIDDEN,
		config: { tension: 300, friction: 20 },
	});


	// --- ジェスチャーハンドラ ---
	const bind = useGesture(
		{
			// ドラッグ終了時の処理
			onDrag: ({ last, movement: [mx, my], velocity: [vx, vy], direction: [dx, dy], tap, event }) => {
				// タップ or ドラッグ中でない場合は何もしない
				if (tap || !last) return;
				event.stopPropagation();

				const absMx = Math.abs(mx);
				const absMy = Math.abs(my);

				// 左右のフリック（ページめくり）
				if (absMx > absMy && absMx > GESTURE_SETTINGS.FLICK_DISTANCE_THRESHOLD && Math.abs(vx) > flickVelocityThreshold) {
					const newPage = Math.max(0, Math.min(maxPage, currentPage - Math.sign(dx)));
					if (newPage !== currentPage) onPageChange(newPage);
					return;
				}

				// 上下のスワイプ（手札の表示/非表示）
				if (absMy > absMx && absMy > GESTURE_SETTINGS.FLICK_DISTANCE_THRESHOLD && Math.abs(vy) > (flickVelocityThreshold * 0.5)) {
					const swipeUp = dy < 0;
					// プレイヤーの位置に応じてスワイプ方向と表示/非表示のロジックを切り替え
					if (isTopPlayer) {
						if (swipeUp && isVisibleRef.current) onVisibilityChange(false); // 上スワイプで非表示
						if (!swipeUp && !isVisibleRef.current) onVisibilityChange(true); // 下スワイプで表示
					} else {
						if (swipeUp && !isVisibleRef.current) onVisibilityChange(true);  // 上スワイプで表示
						if (!swipeUp && isVisibleRef.current) onVisibilityChange(false); // 下スワイプで非表示
					}
				}
			},
			// クリック時の処理（カード選択解除）
			onClick: ({ event }) => {
				event.stopPropagation();
				// 手札が表示されていて、かつ何かしらのカードが選択されている場合に選択を解除
				if (isVisibleRef.current && selectedCardId) {
					selectCard(null);
				}
			},
		},
		{
			enabled: !isInteractionLocked, // カード選択時などはジェスチャーを無効化
			drag: {
				filterTaps: true, // タップをドラッグとして扱わない
				threshold: GESTURE_SETTINGS.DRAG_THRESHOLD,
			},
		}
	);

	// --- メモ化された値 ---
	// カードリストをページごとに分割する
	const pages = useMemo(() => {
		const result: CardWithInstanceId[][] = [];
		for (let i = 0; i < cards.length; i += HAND_LAYOUT.CARDS_PER_PAGE) {
			result.push(cards.slice(i, i + HAND_LAYOUT.CARDS_PER_PAGE));
		}
		return result;
	}, [cards]);

	// --- レンダリング ---
	return (
		<animated.group position={to([z], (zVal) => [0, HAND_LAYOUT.POSITION_Y, isTopPlayer ? -zVal : zVal])}>
			{/* ジェスチャーを受け取るための透明なPlane */}
			<Plane
				args={[HAND_LAYOUT.PAGE_WIDTH + HAND_LAYOUT.GESTURE_PLANE.WIDTH_PADDING, swipeAreaHeight]}
				rotation={[HAND_LAYOUT.GESTURE_PLANE.ROTATION_X, 0, 0]}
				position={[0, HAND_LAYOUT.GESTURE_PLANE.POSITION_Y, HAND_LAYOUT.GESTURE_PLANE.POSITION_Z]}
				{...bind()}
			>
				<meshStandardMaterial
					color="red"
					transparent
					opacity={0.3}
					visible={isGestureAreaVisible}
				/>
			</Plane>

			{/* ページングされるカード群 */}
			<animated.group position-x={x}>
				{pages.map((pageCards, pageIndex) => (
					<group key={pageIndex} position={[pageIndex * (HAND_LAYOUT.PAGE_WIDTH + HAND_LAYOUT.PAGE_TRANSITION_SPACING), 0, 0]}>
						{pageCards.map((card, cardIndex) => (
							<CardInLine
								key={card.instanceId}
								card={card}
								index={cardIndex}
								player={player}
								isTopPlayer={isTopPlayer}
								isSelected={selectedCardId === card.instanceId}
								isListVisible={isVisible}
							/>
						))}
					</group>
				))}
			</animated.group>
		</animated.group>
	);
};


// --- CardInLineコンポーネント ---

interface CardInLineProps {
	card: CardWithInstanceId;
	index: number;
	player: PlayerId;
	isTopPlayer: boolean;
	isSelected: boolean;
	isListVisible: boolean;
}

/**
 * 手札の中で横一列に並ぶ個々のカード。
 * 位置計算と表示状態に応じたアニメーションを担当する。
 */
const CardInLine: React.FC<CardInLineProps> = ({ card, index, player, isTopPlayer, isSelected, isListVisible }) => {
	// --- 位置計算 ---
	const totalWidth = HAND_LAYOUT.PAGE_WIDTH;
	const startX = -totalWidth / 2;
	const xPos = startX + index * (HAND_LAYOUT.CARD_WIDTH + HAND_LAYOUT.CARD_SPACING) + HAND_LAYOUT.CARD_WIDTH / 2;

	// --- 角度計算 ---
	const tiltAngle = isTopPlayer ? HAND_LAYOUT.TILT_ANGLES.TOP_PLAYER : HAND_LAYOUT.TILT_ANGLES.BOTTOM_PLAYER;
	const yRotation = isTopPlayer ? HAND_LAYOUT.Y_ROTATIONS.TOP_PLAYER : HAND_LAYOUT.Y_ROTATIONS.BOTTOM_PLAYER;

	const coefficient = isTopPlayer ? -1 : 1; // プレイヤーの位置に応じてZ座標の符号を反転

	// --- アニメーション ---
	const { z, opacity } = useSpring({
		/**
		 * 選択されたカードかどうかに応じてZ座標（奥行き）を変化させる。
		 * - 選択されたカード (isSelected: true): 少し手前 (Z_POS_SELECTED) に移動し、視覚的に浮き上がって見えるようにする。
		 * - 選択されていないカード (isSelected: false): デフォルトのZ座標 (Z_POS_DEFAULT) に留まる。
		 */
		z: isSelected ? coefficient * HAND_LAYOUT.CARD_IN_LINE_ANIMATION.Z_POS_SELECTED : coefficient * HAND_LAYOUT.CARD_IN_LINE_ANIMATION.Z_POS_DEFAULT,
		/**
		 * カードリストの表示状態と、カード自身の選択状態に応じて不透明度を変化させる。
		 * - パターン1: カードリストが表示状態 (isListVisible: true)
		 * => 全てのカードは完全不透明 (OPACITY_VISIBLE) になる。
		 * - パターン2: カードリストが非表示状態 (isListVisible: false)
		 * - 選択されているカード (isSelected: true): 完全不透明 (OPACITY_VISIBLE) を維持する。
		 * - 選択されていないカード (isSelected: false): 半透明 (OPACITY_HIDDEN) になり、選択中のカードを際立たせる。
		 */
		opacity: isListVisible
			? HAND_LAYOUT.CARD_IN_LINE_ANIMATION.OPACITY_VISIBLE
			: (isSelected ? HAND_LAYOUT.CARD_IN_LINE_ANIMATION.OPACITY_VISIBLE : HAND_LAYOUT.CARD_IN_LINE_ANIMATION.OPACITY_HIDDEN),
		// アニメーションの物理的な挙動（バネの硬さや摩擦）を設定
		config: HAND_LAYOUT.CARD_IN_LINE_ANIMATION.SPRING_CONFIG,
	});

	// --- レンダリング ---
	return (
		<animated.group position-x={xPos} position-z={z}>
			<group rotation={[tiltAngle, yRotation, 0]} scale={HAND_LAYOUT.CARD_SCALE}>
				<Card3D
					card={card}
					position={[0, 0, 0]}
					player={player}
					width={HAND_LAYOUT.CARD_WIDTH}
					opacity={opacity}
				/>
			</group>
		</animated.group>
	);
};

export default Hand3D;