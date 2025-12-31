import { animated, to, useSpring } from "@react-spring/three";
import { Plane } from "@react-three/drei";
import { useGesture } from "@use-gesture/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUIStore } from "@/core/store/uiStore";
import { useGameQuery } from "@/core/api/queries";
import type { CardDefinition, PlayerType } from "@/shared/types/game-schema";
import Card3D from "./Card3D";
import cardMasterData from "@/shared/data/cardMasterData";
import { DESIGN, getHandPageWidth } from "@/shared/constants/design-tokens";

type CardWithInstanceId = CardDefinition & { instanceId: string };

/**
 * 3D 手札管理コンポーネント (Hand3D)
 */
const Hand3D: React.FC<{ player: PlayerType }> = ({ player }) => {
  const playerState = useGameQuery.usePlayer(player);
  const { selectedCardId, deselectCard, isInteractionLocked } = useUIStore();
  const activePlayerId = useGameQuery.useActivePlayer();

  const [isVisible, setIsVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const facingFactor = playerState?.facingFactor ?? 1;

  // --- 1. ロジック追加: 手番と選択状態の判定 ---
  const isMyTurn = activePlayerId === player;
  const isAnyCardSelected = !!selectedCardId;

  // 表示制御: 手番でなければ強制非表示、手番ならUI操作(isVisible)に従う
  // ただし、カード選択中(詠唱中)は、手札全体としては「表示」位置に留まる必要がある（選択カードを見せるため）
  const effectiveIsVisible = isMyTurn && isVisible;

  const cards = useMemo(() => {
    if (!playerState) return [];
    return playerState.cardLibrary
      .map((instance) => {
        const def = cardMasterData.find(
          (c) => c.id === instance.cardDefinitionId,
        );
        return def ? { ...def, instanceId: instance.instanceId } : null;
      })
      .filter((c): c is CardWithInstanceId => c !== null);
  }, [playerState]);

  const maxPage = Math.max(
    0,
    Math.ceil(cards.length / DESIGN.HAND.CARDS_PER_PAGE) - 1,
  );
  const isVisibleRef = useRef(isVisible);

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  const { x } = useSpring({
    x:
      -currentPage *
      (getHandPageWidth() + DESIGN.HAND.PAGE_TRANSITION_SPACING) *
      facingFactor,
    config: DESIGN.HAND.ANIMATION.PAGE_TRANSITION,
  });

  // Z位置の制御: 手番外なら HIDDEN (画面外) へ
  const { zPos } = useSpring({
    zPos: effectiveIsVisible
      ? DESIGN.HAND.Z_POSITIONS.VISIBLE
      : DESIGN.HAND.Z_POSITIONS.HIDDEN,
    config: DESIGN.HAND.ANIMATION.SPRING_CONFIG,
  });

  const bind = useGesture(
    {
      onDrag: ({
        movement: [mx, my],
        velocity: [vx, vy],
        direction: [dx, dy],
        last,
        tap,
        event,
      }) => {
        if (tap || !last) return;
        event.stopPropagation();
        const { FLICK_DISTANCE, FLICK_VELOCITY_DEFAULT } =
          DESIGN.HAND.GESTURE_THRESHOLDS;

        if (Math.abs(mx) > Math.abs(my)) {
          if (
            Math.abs(mx) > FLICK_DISTANCE &&
            Math.abs(vx) > FLICK_VELOCITY_DEFAULT
          ) {
            const pageIncrement = -Math.sign(dx) * facingFactor;
            setCurrentPage((prev) =>
              Math.max(0, Math.min(maxPage, prev + pageIncrement)),
            );
          }
        } else {
          if (
            Math.abs(my) > FLICK_DISTANCE &&
            Math.abs(vy) > FLICK_VELOCITY_DEFAULT * 0.5
          ) {
            const shouldHide = dy * facingFactor > 0;
            const shouldShow = dy * facingFactor < 0;
            if (shouldHide && isVisibleRef.current) setIsVisible(false);
            else if (shouldShow && !isVisibleRef.current) setIsVisible(true);
          }
        }
      },
      onClick: ({ event }) => {
        event.stopPropagation();
        // カード選択中に背景（ジェスチャーエリア）をクリックしたらキャンセル
        if (effectiveIsVisible && selectedCardId) deselectCard();
      },
    },
    {
      // 手番外、または操作ロック中はジェスチャー無効
      enabled: !isInteractionLocked && isMyTurn,
      drag: {
        filterTaps: true,
        threshold: DESIGN.HAND.GESTURE_THRESHOLDS.DRAG,
      },
    },
  );

  const pages = useMemo(() => {
    const result: CardWithInstanceId[][] = [];
    for (let i = 0; i < cards.length; i += DESIGN.HAND.CARDS_PER_PAGE) {
      result.push(cards.slice(i, i + DESIGN.HAND.CARDS_PER_PAGE));
    }
    return result;
  }, [cards]);

  if (!playerState) return null;

  return (
    <animated.group
      position={to([zPos], (v) => [
        0,
        DESIGN.HAND.POSITION_Y,
        v * facingFactor,
      ])}
    >
      <Plane
        args={[getHandPageWidth() + DESIGN.HAND.GESTURE_PLANE.WIDTH_PADDING, 4]}
        rotation={[DESIGN.HAND.GESTURE_PLANE.ROTATION_X, 0, 0]}
        position={[
          0,
          DESIGN.HAND.GESTURE_PLANE.POSITION_Y,
          DESIGN.HAND.GESTURE_PLANE.POSITION_Z,
        ]}
        {...bind()}
      >
        <meshStandardMaterial transparent opacity={0} />
      </Plane>

      <animated.group position-x={x}>
        {pages.map((pageCards, pageIndex) => (
          <group
            key={pageIndex}
            position={[
              pageIndex *
                (getHandPageWidth() + DESIGN.HAND.PAGE_TRANSITION_SPACING) *
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
                facingFactor={facingFactor as 1 | -1}
                isSelected={selectedCardId === card.instanceId}
                isAnySelected={isAnyCardSelected} // 追加: 誰かが選択されているか
                isVisible={effectiveIsVisible}
              />
            ))}
          </group>
        ))}
      </animated.group>
    </animated.group>
  );
};

const CardInLine: React.FC<{
  card: CardWithInstanceId;
  index: number;
  player: PlayerType;
  facingFactor: 1 | -1;
  isSelected: boolean;
  isAnySelected: boolean;
  isVisible: boolean;
}> = ({
  card,
  index,
  player,
  facingFactor,
  isSelected,
  isAnySelected,
  isVisible,
}) => {
  const pageWidth = getHandPageWidth();
  const xPos =
    facingFactor *
    (-pageWidth / 2 +
      index * (DESIGN.HAND.CARD_WIDTH + DESIGN.HAND.CARD_SPACING) +
      DESIGN.HAND.CARD_WIDTH / 2);

  // --- 2. ロジック追加: 不透明度の計算 ---
  // - 手札自体が表示OFFなら 0
  // - 何かが選択されている場合:
  //    - 自分が選択されている -> 1 (表示)
  //    - 自分が選択されていない -> 0 (Hide)
  // - 何も選択されていない場合 -> 1 (通常表示)
  const targetOpacity = !isVisible
    ? 0.5
    : isAnySelected
      ? isSelected
        ? 1
        : 0.5
      : 1;

  const { z, opacity } = useSpring({
    z: isSelected
      ? facingFactor * DESIGN.HAND.ANIMATION.Z_POS_SELECTED
      : facingFactor * DESIGN.HAND.ANIMATION.Z_POS_DEFAULT,
    opacity: targetOpacity,
    config: DESIGN.HAND.ANIMATION.SPRING_CONFIG,
  });

  return (
    <animated.group position-x={xPos} position-z={z}>
      <group
        rotation={[
          DESIGN.HAND.TILT_ANGLE_BASE * -facingFactor,
          ((1 - facingFactor) / 2) * DESIGN.HAND.Y_ROTATION_BASE,
          0,
        ]}
        scale={DESIGN.HAND.CARD_SCALE}
      >
        <Card3D
          card={card}
          player={player}
          width={DESIGN.HAND.CARD_WIDTH}
          opacity={opacity}
        />
      </group>
    </animated.group>
  );
};

export default Hand3D;
