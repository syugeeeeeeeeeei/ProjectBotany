// src/features/card-hand/ui/Hand3D.tsx
import React from "react";
import { animated, to, useSpring } from "@react-spring/three";
import { Plane } from "@react-three/drei";
import type { PlayerType, CardDefinition } from "@/shared/types/game-schema";

import { useHandLogic } from "../hooks/useHandLogic";
import { HandLayout } from "../domain/cardLayout";
import Card3D from "./Card3D";

type CardWithInstanceId = CardDefinition & { instanceId: string };

interface CardWrapperProps {
  card: CardWithInstanceId;
  index: number;
  player: PlayerType;
  facingFactor: number;
  isSelected: boolean;
  isAnySelected: boolean;
  isVisible: boolean;
}

const CardWrapper: React.FC<CardWrapperProps> = ({
  card,
  index,
  player,
  facingFactor,
  isSelected,
  isAnySelected,
  isVisible,
}) => {
  const xLocal = HandLayout.calcCardXLocal(index, facingFactor);

  const targetOpacity = HandLayout.calcTargetOpacity({
    isVisible,
    isAnySelected,
    isSelected,
  });

  const { z, opacity } = useSpring({
    // 修正：isVisible と isAnySelected を渡す
    z: HandLayout.calcTargetZ({
      isSelected,
      isAnySelected,
      isVisible,
      facingFactor,
    }),
    opacity: targetOpacity,
    config: HandLayout.ANIMATION.SPRING_CONFIG,
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
        <Card3D
          card={card}
          player={player}
          opacity={opacity as unknown as number}
        />
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

  const gesturePlaneArgs = HandLayout.calcGesturePlaneArgs(layout.pageWidth);

  return (
    <animated.group
      position={to([layout.zPos], (z) => [
        HandLayout.POSITION.X,
        HandLayout.POSITION.Y,
        z * layout.facingFactor,
      ])}
    >
      {/* Gesture Area */}
      <Plane
        args={gesturePlaneArgs}
        rotation={[
          HandLayout.GESTURE.ROTATION.X,
          HandLayout.GESTURE.ROTATION.Y,
          HandLayout.GESTURE.ROTATION.Z,
        ]}
        position={[
          HandLayout.GESTURE.POSITION.X,
          HandLayout.GESTURE.POSITION.Y,
          HandLayout.GESTURE.POSITION.Z,
        ]}
        {...bindGesture()}
      >
        <meshStandardMaterial
          transparent
          opacity={HandLayout.GESTURE.MATERIAL.OPACITY}
          depthWrite={HandLayout.GESTURE.MATERIAL.DEPTH_WRITE}
        />
      </Plane>

      {/* Cards List */}
      <animated.group position-x={layout.xPos}>
        {pages.map((pageCards, pageIndex) => (
          <group
            key={pageIndex}
            position-x={HandLayout.calcPageOffsetX({
              pageIndex,
              pageWidth: layout.pageWidth,
              facingFactor: layout.facingFactor,
            })}
          >
            {pageCards.map((card, cardIndex) => (
              <CardWrapper
                key={card.instanceId}
                card={card}
                index={cardIndex}
                player={player}
                facingFactor={layout.facingFactor}
                isSelected={state.selectedCardId === card.instanceId}
                isAnySelected={state.isMyCardSelected} // 修正：自分の手札の選択状況のみを渡す
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
