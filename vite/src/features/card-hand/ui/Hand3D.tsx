import { animated, to, useSpring } from "@react-spring/three";
import { Plane } from "@react-three/drei";
import { type DragState, useGesture } from "@use-gesture/react";
import React, { useEffect, useMemo, useRef } from "react";
import { useUIStore } from "@/app/store/useUIStore";
import { useGameStore } from "@/app/store/useGameStore";
import type { CardDefinition, PlayerType } from "@/shared/types/game-schema";
import Card3D from "./Card3D";
import type { DebugSettings } from "@/shared/components/debug/DebugDialog";

/**
 * 3D 手札管理コンポーネント (Hand3D)
 * 
 * 【動機】
 * 手札カードの集合体（デッキ）を 3D 空間に整列させ、ユーザーが直感的にブラウズできるようにするためです。
 * モバイル端末等での操作を想定し、フリック（スワイプ）によるページめくりや、
 * 視点に基づいた適切な配置と傾き（Tilt）を自動計算します。
 *
 * 【恩恵】
 * - `use-gesture` による高度なジェスチャーハンドリング（水平フリックでページ切り替え、垂直フリックで表示/非表示）を提供します。
 * - プレイヤー（在来種/外来種）ごとに反転した配置（Facing Factor）を自動適用し、対戦形式のレイアウトを容易に実現します。
 * - ページング計算（3枚ごと）を内包し、大量のカードを整理して表示できます。
 *
 * 【使用法】
 * `App.tsx` 内でプレイヤーごとに配置します。`isVisible` や `currentPage` などの
 * 状態を受け取り、シーン全体と同期して動作します。
 */

// --- 型定義 ---

type CardWithInstanceId = CardDefinition & { instanceId: string };

interface Hand3DProps {
  player: PlayerType;
  cards: CardWithInstanceId[];
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  debugSettings: DebugSettings;
  isInteractionLocked: boolean;
}

// --- 定数定義 ---

const HAND_LAYOUT = {
  CARDS_PER_PAGE: 3,
  CARD_WIDTH: 1.8,
  CARD_SPACING: 0.8,
  get PAGE_WIDTH() {
    return (
      this.CARDS_PER_PAGE * this.CARD_WIDTH +
      (this.CARDS_PER_PAGE - 1) * this.CARD_SPACING
    );
  },
  PAGE_TRANSITION_SPACING: 1,
  POSITION_Y: 2.2,
  Z_POSITIONS: { VISIBLE: 3.5, HIDDEN: 6 },
  TILT_ANGLE_BASE: Math.PI / 2.2,
  Y_ROTATION_BASE: Math.PI,
  CARD_SCALE: 1.25,
  GESTURE_PLANE: {
    WIDTH_PADDING: 4,
    ROTATION_X: -Math.PI / 2,
    POSITION_Y: -0.2,
    POSITION_Z: -0.15,
  },
  CARD_IN_LINE_ANIMATION: {
    Z_POS_SELECTED: -0.5,
    Z_POS_DEFAULT: 0,
    OPACITY_VISIBLE: 1,
    OPACITY_HIDDEN: 0.5,
    SPRING_CONFIG: { tension: 300, friction: 20 },
  },
};

const GESTURE_SETTINGS = { FLICK_DISTANCE_THRESHOLD: 45, DRAG_THRESHOLD: 10 };

const Hand3D: React.FC<Hand3DProps> = ({
  player,
  cards,
  isVisible,
  onVisibilityChange,
  currentPage,
  onPageChange,
  debugSettings,
  isInteractionLocked,
}) => {
  const { isGestureAreaVisible, flickVelocityThreshold, swipeAreaHeight } =
    debugSettings;
  const { deselectCard, selectedCardId } = useUIStore();
  const { playerStates } = useGameStore();
  const { facingFactor } = playerStates[player];

  const maxPage = Math.ceil(cards.length / HAND_LAYOUT.CARDS_PER_PAGE) - 1;
  const isVisibleRef = useRef(isVisible);
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  const { x } = useSpring({
    x:
      -currentPage *
      (HAND_LAYOUT.PAGE_WIDTH + HAND_LAYOUT.PAGE_TRANSITION_SPACING) *
      facingFactor,
    config: { tension: 300, friction: 30 },
  });

  const { z } = useSpring({
    z: isVisible
      ? HAND_LAYOUT.Z_POSITIONS.VISIBLE
      : HAND_LAYOUT.Z_POSITIONS.HIDDEN,
    config: { tension: 300, friction: 20 },
  });

  /**
   * 水平方向のフリック（スワイプ）によるページ切り替え処理
   * モバイル等のタッチデバイスで、手札を「めくる」操作感を提供するために必要です
   */
  const handleHorizontalFlick = (state: DragState) => {
    const {
      movement: [mx],
      velocity: [vx],
      direction: [dx],
    } = state;
    if (
      Math.abs(mx) > GESTURE_SETTINGS.FLICK_DISTANCE_THRESHOLD &&
      Math.abs(vx) > flickVelocityThreshold
    ) {
      const pageIncrement = -Math.sign(dx) * facingFactor;
      const newPage = Math.max(
        0,
        Math.min(maxPage, currentPage + pageIncrement),
      );
      if (newPage !== currentPage) onPageChange(newPage);
    }
  };

  /**
   * 垂直方向のフリックによる手札の出し入れ（表示/非表示）処理
   * 画面を広く使いたい時に、一時的に手札を画面外に隠すために必要です
   */
  const handleVerticalFlick = (state: DragState) => {
    const {
      movement: [_, my],
      velocity: [__, vy],
      direction: [___, dy],
    } = state;
    if (
      Math.abs(my) > GESTURE_SETTINGS.FLICK_DISTANCE_THRESHOLD &&
      Math.abs(vy) > flickVelocityThreshold * 0.5
    ) {
      const shouldHide = dy * facingFactor > 0;
      const shouldShow = dy * facingFactor < 0;
      if (shouldHide && isVisibleRef.current) onVisibilityChange(false);
      else if (shouldShow && !isVisibleRef.current) onVisibilityChange(true);
    }
  };

  const bind = useGesture(
    {
      onDrag: (state) => {
        const {
          last,
          movement: [mx, my],
          tap,
          event,
        } = state;
        if (tap || !last) return;
        event.stopPropagation();
        if (Math.abs(mx) > Math.abs(my)) handleHorizontalFlick(state);
        else handleVerticalFlick(state);
      },
      onClick: ({ event }) => {
        event.stopPropagation();
        if (isVisibleRef.current && selectedCardId) deselectCard();
      },
    },
    {
      enabled: !isInteractionLocked,
      drag: { filterTaps: true, threshold: GESTURE_SETTINGS.DRAG_THRESHOLD },
    },
  );

  // カードリストをページ単位（3枚ずつ）の二次元配列に変換
  // `pages.map` を通じてページごとのグループ化描画を行うために必要です
  const pages = useMemo(() => {
    const allPages: CardWithInstanceId[][] = [];
    for (let i = 0; i < cards.length; i += HAND_LAYOUT.CARDS_PER_PAGE) {
      allPages.push(cards.slice(i, i + HAND_LAYOUT.CARDS_PER_PAGE));
    }
    return allPages;
  }, [cards]);

  return (
    <animated.group
      position={to([z], (zVal) => [
        0,
        HAND_LAYOUT.POSITION_Y,
        zVal * facingFactor,
      ])}
    >
      <Plane
        args={[
          HAND_LAYOUT.PAGE_WIDTH + HAND_LAYOUT.GESTURE_PLANE.WIDTH_PADDING,
          swipeAreaHeight,
        ]}
        rotation={[HAND_LAYOUT.GESTURE_PLANE.ROTATION_X, 0, 0]}
        position={[
          0,
          HAND_LAYOUT.GESTURE_PLANE.POSITION_Y,
          HAND_LAYOUT.GESTURE_PLANE.POSITION_Z,
        ]}
        {...bind()}
      >
        <meshStandardMaterial
          color="red"
          transparent
          opacity={0.3}
          visible={isGestureAreaVisible}
        />
      </Plane>
      <animated.group position-x={x}>
        {pages.map((pageCards, pageIndex) => (
          <group
            key={pageIndex}
            position={[
              pageIndex *
                (HAND_LAYOUT.PAGE_WIDTH + HAND_LAYOUT.PAGE_TRANSITION_SPACING) *
                facingFactor,
              0,
              0,
            ]}
          >
            {pageCards.map((card, cardIndex) => (
              <CardInLine
                key={card.instanceId}
                card={card}
                index={cardIndex}
                player={player}
                facingFactor={facingFactor}
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

interface CardInLineProps {
  card: CardWithInstanceId;
  index: number;
  player: PlayerType;
  facingFactor: 1 | -1;
  isSelected: boolean;
  isListVisible: boolean;
}

const CardInLine: React.FC<CardInLineProps> = ({
  card,
  index,
  player,
  facingFactor,
  isSelected,
  isListVisible,
}) => {
  const xPos =
    facingFactor *
    (-HAND_LAYOUT.PAGE_WIDTH / 2 +
      index * (HAND_LAYOUT.CARD_WIDTH + HAND_LAYOUT.CARD_SPACING) +
      HAND_LAYOUT.CARD_WIDTH / 2);
  const tiltAngle = HAND_LAYOUT.TILT_ANGLE_BASE * -facingFactor;
  const yRotation = ((1 - facingFactor) / 2) * HAND_LAYOUT.Y_ROTATION_BASE;
  const { z, opacity } = useSpring({
    z: isSelected
      ? facingFactor * HAND_LAYOUT.CARD_IN_LINE_ANIMATION.Z_POS_SELECTED
      : facingFactor * HAND_LAYOUT.CARD_IN_LINE_ANIMATION.Z_POS_DEFAULT,
    opacity: isListVisible ? 1 : isSelected ? 1 : 0.5,
    config: HAND_LAYOUT.CARD_IN_LINE_ANIMATION.SPRING_CONFIG,
  });
  return (
    <animated.group position-x={xPos} position-z={z}>
      <group
        rotation={[tiltAngle, yRotation, 0]}
        scale={HAND_LAYOUT.CARD_SCALE}
      >
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
