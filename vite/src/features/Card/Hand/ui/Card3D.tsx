// vite/src/features/card-hand/ui/Card3D.tsx
import React, { useMemo } from "react";
import { animated } from "@react-spring/three";
import { RoundedBox, Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { CardDefinition, PlayerType } from "@/shared/types";

import { useCardLogic, UseCardLogicResult } from "../hooks/useCardLogic";
import { CardLayout } from "../domain/CardLayout";
import {
  createHeaderShape,
  createRoundedRectShape,
} from "./parts/cardGeometries";

const AnimatedMeshStandardMaterial = animated.meshStandardMaterial;
const AnimatedMeshBasicMaterial = animated.meshBasicMaterial;

interface Card3DProps {
  card: CardDefinition & { instanceId: string };
  player: PlayerType;
  opacity: number;
}

const Card3D: React.FC<Card3DProps> = ({ card, player, opacity }) => {
  const { state, data, handlers } = useCardLogic({ card, player });

  const baseShape = useMemo(() => createRoundedRectShape(), []);
  const headerShape = useMemo(() => createHeaderShape(), []);

  return (
    <animated.group
      onPointerEnter={() => state.isPlayable && handlers.setIsHovered(true)}
      onPointerLeave={() => handlers.setIsHovered(false)}
    >
      <CardBase
        isSelected={state.isSelected}
        borderStateColor={data.borderStateColor}
        opacity={opacity}
      />
      <CardBaseInner baseShape={baseShape} opacity={opacity} />
      <CardContentHeader
        card={card}
        opacity={opacity}
        headerShape={headerShape}
        data={data}
      />
      <CardContentCost card={card} opacity={opacity} />
      <CardContentImage opacity={opacity} textureUrl={data.textureUrl} />
      <CardContentDescription opacity={opacity} card={card} />
      <CardOverlayCooldown
        isCooldown={state.isCooldown}
        cooldownRounds={data.cooldownRounds}
        opacity={opacity}
      />
    </animated.group>
  );
};

export default Card3D;

// --- Sub Components ---

const CardBase = ({
  isSelected,
  borderStateColor,
  opacity,
}: {
  isSelected: boolean;
  borderStateColor: string;
  opacity: number;
}) => {
  const { CARD_BASE } = CardLayout;
  return (
    <RoundedBox
      args={[CARD_BASE.WIDTH, CARD_BASE.HEIGHT, CARD_BASE.THICKNESS]}
      radius={CARD_BASE.CORNER_RADIUS}
    >
      <AnimatedMeshStandardMaterial
        color={borderStateColor}
        emissive={isSelected ? borderStateColor : "black"}
        emissiveIntensity={isSelected ? 0.5 : 0}
        transparent
        opacity={opacity}
      />
    </RoundedBox>
  );
};

const CardBaseInner = ({
  baseShape,
  opacity,
}: {
  baseShape: THREE.Shape;
  opacity: number;
}) => (
  <mesh position={CardLayout.AREAS.BASE_INNER.POSITION}>
    <shapeGeometry args={[baseShape]} />
    <AnimatedMeshStandardMaterial
      color={CardLayout.COLORS.CARD_UI.BASE_BG}
      transparent
      opacity={opacity}
    />
  </mesh>
);

const CardContentHeader = ({
  card,
  opacity,
  headerShape,
  data,
}: {
  card: CardDefinition;
  opacity: number;
  headerShape: THREE.Shape;
  data: UseCardLogicResult["data"];
}) => (
  <>
    <mesh position={CardLayout.AREAS.HEADER.POSITION}>
      <shapeGeometry args={[headerShape]} />
      <AnimatedMeshBasicMaterial
        color={data.headerColor}
        transparent
        opacity={opacity}
      />
    </mesh>
    <Text
      position={CardLayout.AREAS.TEXT.HEADER.POSITION}
      font={CardLayout.AREAS.TEXT.HEADER.FONT}
      fontSize={CardLayout.AREAS.TEXT.HEADER.FONT_SIZE}
      color={CardLayout.COLORS.CARD_UI.TEXT_WHITE}
      anchorX={CardLayout.AREAS.TEXT.HEADER.ANCHOR_X}
      anchorY={CardLayout.AREAS.TEXT.HEADER.ANCHOR_Y}
      maxWidth={CardLayout.AREAS.BASE_INNER.CONTENT_WIDTH}
    >
      {card.name}
    </Text>
  </>
);

const CardContentCost = ({
  card,
  opacity,
}: {
  card: CardDefinition;
  opacity: number;
}) => (
  <>
    <mesh position={CardLayout.AREAS.COST.POSITION}>
      <circleGeometry args={[CardLayout.AREAS.COST.RADIUS, 32]} />
      <AnimatedMeshBasicMaterial
        color={CardLayout.COLORS.BORDER}
        transparent
        opacity={opacity}
      />
    </mesh>
    <Text
      position={CardLayout.AREAS.TEXT.COST.POSITION}
      fontSize={CardLayout.AREAS.TEXT.COST.FONT_SIZE}
      font={CardLayout.AREAS.TEXT.COST.FONT}
      color={CardLayout.AREAS.TEXT.COST.COLOR}
      anchorX="center"
      anchorY="middle"
    >
      {card.cost}
    </Text>
  </>
);

const CardContentImage = ({
  opacity,
  textureUrl,
}: {
  opacity: number;
  textureUrl: string;
}) => {
  const texture = useTexture(textureUrl);
  return (
    <animated.mesh position={CardLayout.AREAS.IMAGE.POSITION}>
      <planeGeometry args={CardLayout.AREAS.IMAGE.SIZE} />
      <meshStandardMaterial map={texture} opacity={opacity} />
    </animated.mesh>
  );
};

const CardContentDescription = ({
  opacity,
  card,
}: {
  opacity: number;
  card: CardDefinition;
}) => (
  <>
    <mesh position={CardLayout.AREAS.DESC.POSITION}>
      <planeGeometry args={CardLayout.AREAS.DESC.SIZE} />
      <AnimatedMeshBasicMaterial
        color={CardLayout.COLORS.CARD_UI.DESC_BG}
        opacity={opacity}
      />
    </mesh>
    <Text
      position={CardLayout.AREAS.TEXT.DESC.POSITION}
      font={CardLayout.AREAS.TEXT.DESC.FONT}
      fontSize={CardLayout.AREAS.TEXT.DESC.FONT_SIZE}
      color={CardLayout.COLORS.CARD_UI.TEXT_BLACK}
      anchorX={CardLayout.AREAS.TEXT.DESC.ANCHOR_X}
      anchorY={CardLayout.AREAS.TEXT.DESC.ANCHOR_Y}
      maxWidth={CardLayout.AREAS.TEXT.DESC.MAX_WIDTH}
      lineHeight={CardLayout.AREAS.TEXT.DESC.LINE_HEIGHT}
      overflowWrap={CardLayout.AREAS.TEXT.DESC.OVERFLOW_WRAP}
    >
      {card.description}
    </Text>
  </>
);

const CardOverlayCooldown = ({
  isCooldown,
  cooldownRounds,
  opacity,
}: {
  isCooldown: boolean;
  cooldownRounds?: number;
  opacity: number;
}) => {
  if (!isCooldown) return null;
  return (
    <>
      <mesh position={CardLayout.AREAS.COOLDOWN.POSITION}>
        <planeGeometry args={CardLayout.AREAS.COOLDOWN.SIZE} />
        <meshBasicMaterial
          color={CardLayout.AREAS.COOLDOWN.COLOR}
          transparent
          opacity={opacity * 0.6}
        />
      </mesh>
      <Text
        position={CardLayout.AREAS.TEXT.COOLDOWN.POSITION}
        fontSize={CardLayout.AREAS.TEXT.COOLDOWN.FONT_SIZE}
        font={CardLayout.AREAS.TEXT.COOLDOWN.FONT}
        color={CardLayout.AREAS.TEXT.COOLDOWN.COLOR}
        anchorX="center"
        anchorY="middle"
      >
        {cooldownRounds}
      </Text>
    </>
  );
};
