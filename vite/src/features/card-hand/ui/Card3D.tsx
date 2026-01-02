// src/features/card-hand/ui/Card3D.tsx
import React, { useMemo } from "react";
import { animated } from "@react-spring/three";
import { RoundedBox, Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { CardDefinition, PlayerType } from "@/shared/types/game-schema";

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
  const texture = useTexture(data.textureUrl);

  const baseShape = useMemo(() => createRoundedRectShape(), []);
  const headerShape = useMemo(() => createHeaderShape(), []);

  return (
    <animated.group
      onClick={handlers.onClick}
      onPointerEnter={handlers.onPointerEnter}
      onPointerLeave={handlers.onPointerLeave}
    >
      {/* 改善ポイント: 
        パーツごとのgroupを排除し、すべてのパーツをCard3D直下の座標系(カード中心)で配置します。
        各パーツコンポーネントは座標(position)を受け取るか、内部でCardLayoutの絶対座標定義を使用します。
      */}

      {/* Layer 1: Border */}
      <CardBase state={state} opacity={opacity} />

      {/* Layer 2: Inner Background */}
      <CardBaseInner baseShape={baseShape} opacity={opacity} />

      {/* Layer 3: Contents (Header, Cost, Image, Desc) */}
      <CardContentHeader
        card={card}
        opacity={opacity}
        headerShape={headerShape}
        data={data}
      />

      <CardContentCost card={card} opacity={opacity} />

      <CardContentImage opacity={opacity} texture={texture} />

      <CardContentDescription opacity={opacity} card={card} />

      {/* Layer 4: Overlay */}
      <CardOverlayCooldown state={state} data={data} opacity={opacity} />
    </animated.group>
  );
};

export default Card3D;

// --- Sub Components (Flat Layout) ---

const CardBase = ({
  state,
  opacity,
}: {
  state: UseCardLogicResult["state"];
  opacity: number;
}) => {
  const { CARD_BASE, COLORS } = CardLayout;
  return (
    <RoundedBox
      args={[CARD_BASE.WIDTH, CARD_BASE.HEIGHT, CARD_BASE.THICKNESS]}
      radius={CARD_BASE.CORNER_RADIUS}
    >
      <AnimatedMeshStandardMaterial
        color={COLORS.BORDER}
        emissive={state.isSelected ? COLORS.BORDER : "black"}
        emissiveIntensity={state.isSelected ? 0.5 : 0}
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
}) => {
  return (
    <mesh position={CardLayout.AREAS.BASE_INNER.POSITION}>
      <shapeGeometry args={[baseShape]} />
      <AnimatedMeshStandardMaterial
        color={CardLayout.COLORS.CARD_UI.BASE_BG}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
};

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
}) => {
  const { AREAS, COLORS } = CardLayout;
  return (
    <>
      <mesh position={AREAS.HEADER.POSITION}>
        <shapeGeometry args={[headerShape]} />
        <AnimatedMeshBasicMaterial
          color={data.headerColor}
          transparent
          opacity={opacity}
        />
      </mesh>
      <Text
        position={AREAS.TEXT.HEADER.POSITION}
        font={AREAS.TEXT.HEADER.FONT}
        fontSize={AREAS.TEXT.HEADER.FONT_SIZE}
        color={COLORS.CARD_UI.TEXT_WHITE}
        anchorX={AREAS.TEXT.HEADER.ANCHOR_X}
        anchorY={AREAS.TEXT.HEADER.ANCHOR_Y}
        maxWidth={AREAS.BASE_INNER.CONTENT_WIDTH}
      >
        {card.name}
      </Text>
    </>
  );
};

const CardContentCost = ({
  card,
  opacity,
}: {
  card: CardDefinition;
  opacity: number;
}) => {
  const { AREAS, COLORS } = CardLayout;
  return (
    <>
      <mesh position={AREAS.COST.POSITION}>
        <circleGeometry args={[AREAS.COST.RADIUS, 32]} />
        <AnimatedMeshBasicMaterial
          color={COLORS.BORDER}
          transparent
          opacity={opacity}
        />
      </mesh>
      <Text
        position={AREAS.TEXT.COST.POSITION}
        fontSize={AREAS.TEXT.COST.FONT_SIZE}
        font={AREAS.TEXT.COST.FONT}
        color={AREAS.TEXT.COST.COLOR}
        anchorX="center"
        anchorY="middle"
      >
        {card.cost}
      </Text>
    </>
  );
};

const CardContentImage = ({
  opacity,
  texture,
}: {
  opacity: number;
  texture: THREE.Texture;
}) => {
  const { AREAS } = CardLayout;
  return (
    <animated.mesh position={AREAS.IMAGE.POSITION}>
      <planeGeometry args={AREAS.IMAGE.SIZE} />
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
}) => {
  const { AREAS, COLORS } = CardLayout;
  return (
    <>
      <mesh position={AREAS.DESC.POSITION}>
        <planeGeometry args={AREAS.DESC.SIZE} />
        <AnimatedMeshBasicMaterial
          color={COLORS.CARD_UI.DESC_BG}
          transparent
          opacity={opacity}
        />
      </mesh>
      <Text
        position={AREAS.TEXT.DESC.POSITION}
        font={AREAS.TEXT.DESC.FONT}
        fontSize={AREAS.TEXT.DESC.FONT_SIZE}
        color={COLORS.CARD_UI.TEXT_BLACK}
        anchorX={AREAS.TEXT.DESC.ANCHOR_X}
        anchorY={AREAS.TEXT.DESC.ANCHOR_Y}
        maxWidth={AREAS.TEXT.DESC.MAX_WIDTH}
        lineHeight={AREAS.TEXT.DESC.LINE_HEIGHT}
        overflowWrap={AREAS.TEXT.DESC.OVERFLOW_WRAP}
      >
        {card.description}
      </Text>
    </>
  );
};

const CardOverlayCooldown = ({
  state,
  data,
  opacity,
}: {
  state: UseCardLogicResult["state"];
  data: UseCardLogicResult["data"];
  opacity: number;
}) => {
  const { AREAS } = CardLayout;
  if (!state.isCooldown) return null;

  return (
    <>
      <mesh position={AREAS.COOLDOWN.POSITION}>
        <planeGeometry args={AREAS.COOLDOWN.SIZE} />
        <meshBasicMaterial
          color={AREAS.COOLDOWN.COLOR}
          transparent
          opacity={opacity}
        />
      </mesh>
      <Text
        position={AREAS.TEXT.COOLDOWN.POSITION}
        fontSize={AREAS.TEXT.COOLDOWN.FONT_SIZE}
        font={AREAS.TEXT.COOLDOWN.FONT}
        color={AREAS.TEXT.COOLDOWN.COLOR}
        anchorX={AREAS.TEXT.COOLDOWN.ANCHOR_X}
        anchorY={AREAS.TEXT.COOLDOWN.ANCHOR_Y}
      >
        {data.cooldownTurns}
      </Text>
    </>
  );
};
