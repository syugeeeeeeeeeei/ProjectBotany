import React from "react";
import { animated, to, useSpring } from "@react-spring/three";
import { Plane } from "@react-three/drei";
import type { PlayerType, CardDefinition } from "@/shared/types/game-schema";

import { useHandLogic } from "../hooks/useHandLogic";
import { CardLayout, HandLayout } from "@/features/card-hand/domain/cardLayout";
import Card3D from "./Card3D";

type CardWithInstanceId = CardDefinition & { instanceId: string };

const CardWrapper: React.FC<{
  card: CardWithInstanceId;
  index: number;
  player: PlayerType;
  facingFactor: number;
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
  const pageWidth = HandLayout.getPageWidth();
  const cardWidth = CardLayout.SIZE.WIDTH;
  const spacing = HandLayout.CARD_SPACING;

  const xLocal =
    (-pageWidth / 2 + index * (cardWidth + spacing) + cardWidth / 2) *
    facingFactor;

  const targetOpacity = !isVisible
    ? 0.5
    : isAnySelected
      ? isSelected
        ? 1
        : 0.5
      : 1;

  const { z, opacity } = useSpring({
    z: isSelected
      ? facingFactor * HandLayout.ANIMATION.Z_SELECTED
      : facingFactor * HandLayout.ANIMATION.Z_DEFAULT,
    opacity: targetOpacity,
    config: { tension: 300, friction: 20 },
  });

  return (
    <animated.group position-x={xLocal} position-z={z}>
      <group
        rotation={[
          HandLayout.CARD.ROTATION.X(facingFactor),
          HandLayout.CARD.ROTATION.Y(facingFactor),
          HandLayout.CARD.ROTATION.Z,
        ]}
        scale={HandLayout.CARD.SCALE}
      >
        <Card3D card={card} player={player} opacity={opacity} />
      </group>
    </animated.group>
  );
};

const Hand3D: React.FC<{ player: PlayerType }> = ({ player }) => {
  const { state, layout, bindGesture } = useHandLogic(player);

  if (state.cards.length === 0) return null;

  const pages: CardWithInstanceId[][] = [];
  for (let i = 0; i < state.cards.length; i += HandLayout.CARDS_PER_PAGE) {
    pages.push(state.cards.slice(i, i + HandLayout.CARDS_PER_PAGE));
  }

  return (
    <animated.group
      position={to([layout.zPos], (z) => [
        0,
        HandLayout.POSITION.Y,
        z * layout.facingFactor,
      ])}
    >
      {/* Gesture Area */}
      <Plane
        args={[layout.pageWidth + 4, 4]}
        rotation={[
          HandLayout.GESTURE_AREA.ROTATION.X,
          HandLayout.GESTURE_AREA.ROTATION.Y,
          HandLayout.GESTURE_AREA.ROTATION.Z,
        ]}
        position={[
          HandLayout.GESTURE_AREA.POSITION.X,
          HandLayout.GESTURE_AREA.POSITION.Y,
          HandLayout.GESTURE_AREA.POSITION.Z,
        ]}
        {...bindGesture()}
      >
        {/* [重要]他のコンポーネントを分断しないようにdepthWriteをfalseにする */}
        <meshStandardMaterial transparent opacity={0} depthWrite={false} />
      </Plane>

      {/* Cards List */}
      <animated.group position-x={layout.xPos}>
        {pages.map((pageCards, pageIndex) => (
          <group
            key={pageIndex}
            position-x={
              pageIndex *
              (layout.pageWidth + HandLayout.PAGE_SPACING) *
              layout.facingFactor
            }
          >
            {pageCards.map((card, cardIndex) => (
              <CardWrapper
                key={card.instanceId}
                card={card}
                index={cardIndex}
                player={player}
                facingFactor={layout.facingFactor}
                isSelected={state.selectedCardId === card.instanceId}
                isAnySelected={state.isAnyCardSelected}
                isVisible={state.effectiveIsVisible}
              />
            ))}
          </group>
        ))}
      </animated.group>
    </animated.group>
  );
};

export default Hand3D;
