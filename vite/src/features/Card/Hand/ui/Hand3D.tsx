// vite/src/features/card-hand/ui/Hand3D.tsx
import React from "react";
import { animated, to, useSpring } from "@react-spring/three";
import type { PlayerType, CardDefinition } from "@/shared/types";

import { useHandLogic } from "../hooks/useHandLogic";
import { HandLayout } from "../domain/HandLayout";
import Card3D from "./Card3D";
import GestureArea from "./parts/GestureArea";

type CardWithInstanceId = CardDefinition & { instanceId: string };

interface CardWrapperProps {
  card: CardWithInstanceId;
  index: number;
  player: PlayerType;
  isSelected: boolean;
  isAnySelected: boolean;
  isVisible: boolean;
  onSelect: (card: CardWithInstanceId) => void;
  onDeselect: () => void;
}

const CardWrapper: React.FC<CardWrapperProps> = ({
  card,
  index,
  player,
  isSelected,
  isAnySelected,
  isVisible,
  onSelect,
  onDeselect,
}) => {
  const xLocal = HandLayout.calcCardXLocal(index);
  const targetOpacity = isSelected
    ? 1
    : HandLayout.calcTargetOpacity({ isVisible, isAnySelected, isSelected });
  const targetZ = HandLayout.calcTargetZ({
    isSelected,
    isAnySelected,
    isVisible,
  });

  const spring = useSpring({
    position: [xLocal, 0, targetZ] as [number, number, number],
    rotation: [
      HandLayout.CARD.ROTATION.X,
      HandLayout.CARD.ROTATION.Y,
      HandLayout.CARD.ROTATION.Z,
    ] as [number, number, number],
    opacity: targetOpacity,
    config: HandLayout.ANIMATION.SPRING_CONFIG,
  });

  return (
    <animated.group
      position={spring.position}
      rotation={spring.rotation as unknown as [number, number, number]}
      onClick={(e) => {
        e.stopPropagation();
        console.log(
          `[CardClick] isSelected: ${isSelected}, isAnySelected: ${isAnySelected}`,
        );
        if (isSelected) {
          onDeselect();
          return;
        } else {
          onSelect(card);
        }
      }}
    >
      <Card3D
        card={card}
        player={player}
        opacity={spring.opacity as unknown as number}
      />
    </animated.group>
  );
};

const Hand3D: React.FC<{ player: PlayerType }> = ({ player }) => {
  const { state, layout, handlers } = useHandLogic(player);
  if (state.cards.length === 0) return null;

  const pages: CardWithInstanceId[][] = [];
  for (let i = 0; i < state.cards.length; i += HandLayout.CARDS_PER_PAGE) {
    pages.push(state.cards.slice(i, i + HandLayout.CARDS_PER_PAGE));
  }

  return (
    <animated.group
      position={to([layout.zPos], (z) => [
        HandLayout.POSITION.X,
        HandLayout.POSITION.Y,
        z * layout.facingFactor,
      ])}
      rotation={[0, layout.facingFactor === -1 ? Math.PI : 0, 0]}
    >
      <GestureArea
        onSwipeUp={handlers.onSwipeUp}
        onSwipeDown={handlers.onSwipeDown}
        onSwipeLeft={handlers.onSwipeLeft}
        onSwipeRight={handlers.onSwipeRight}
        onClick={handlers.onAreaClick}
        facingFactor={layout.facingFactor}
        enabled={!state.isInteractionLocked && state.isMyTurn}
      />

      <animated.group position-x={layout.xPos}>
        {pages.map((pageCards, pageIndex) => (
          <group
            key={pageIndex}
            position-x={HandLayout.calcPageOffsetX({
              pageIndex,
              pageWidth: layout.pageWidth,
            })}
          >
            {pageCards.map((card, cardIndex) => (
              <CardWrapper
                key={card.instanceId}
                card={card}
                index={cardIndex}
                player={player}
                isSelected={state.selectedCardId === card.instanceId}
                isAnySelected={state.isAnySelected}
                isVisible={state.effectiveIsVisible}
                onSelect={handlers.onCardSelect}
                onDeselect={handlers.onCardDeselect}
              />
            ))}
          </group>
        ))}
      </animated.group>
    </animated.group>
  );
};

export default Hand3D;
