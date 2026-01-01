// src/features/cards/components/Card3D.tsx
import React, { useMemo } from "react";
import { animated, SpringValue } from "@react-spring/three";
import { RoundedBox, Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { CardDefinition, PlayerType } from "@/shared/types/game-schema";

import { useCardLogic, UseCardLogicResult } from "../hooks/useCardLogic";
import { CardLayout } from "../domain/cardLayout";
import {
  createHeaderShape,
  createRoundedRectShape,
} from "./parts/cardGeometries";

// 型定義の回避
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnimatedMeshStandardMaterial = animated.meshStandardMaterial;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnimatedMeshBasicMaterial = animated.meshBasicMaterial;

interface Card3DProps {
  card: CardDefinition & { instanceId: string };
  player: PlayerType;
  opacity: number;
}

/**
 * Card3D
 * - 静的カード運用前提：外部から幅は受け取らず、CardLayout.BASE.WIDTH を採用する。
 * - 将来可変にしたい場合は CardLayout.calc(width) に width を渡すだけで対応できる。
 */
const Card3D: React.FC<Card3DProps> = ({ card, player, opacity }) => {
  const { state, data, handlers } = useCardLogic({ card, player });
  const texture = useTexture(data.textureUrl);

  // Shapes
  const baseShape = useMemo(() => createRoundedRectShape(), []);

  const headerShape = useMemo(() => createHeaderShape(), []);

  return (
    <animated.group
      onClick={handlers.onClick}
      onPointerEnter={handlers.onPointerEnter}
      onPointerLeave={handlers.onPointerLeave}
    >
      {/* ---------------------------------------------------
          Layer 1: Border & Body (RoundedBox)
          一番下のレイヤー。これがカードの最大サイズ。
      --------------------------------------------------- */}
      <CardBase state={state} opacity={opacity} />

      {/* ---------------------------------------------------
          Layer 2: Inner Base (Shape)
          RoundedBoxの上に置く背景。少し小さいので下が縁に見える。
      --------------------------------------------------- */}
      <CardBaseInner baseShape={baseShape} opacity={opacity} />

      {/* ---------------------------------------------------
          Layer 3: Contents
      --------------------------------------------------- */}

      {/* 3.1 Header */}
      <CardContentHeader
        card={card}
        opacity={opacity}
        headerShape={headerShape}
        data={data}
      />

      {/* 3.2 Image area */}
      <CardContentImage opacity={opacity} texture={texture} />

      {/* 3.3 Description area */}
      <CardContentDescription opacity={opacity} card={card} />

      {/* 3.4 Cooldown overlay */}
      {/* <CardOverlayCooldown state={state} data={data} /> */}
    </animated.group>
  );
};

export default Card3D;

// ---------------------------------------------------
// Components
// ---------------------------------------------------

const CardBase = ({
  state,
  opacity,
}: {
  state: UseCardLogicResult["state"];
  opacity: number | SpringValue<number>;
}) => {
  const { CARD_BASE, COLORS } = CardLayout;
  return (
    <>
      {/* ---------------------------------------------------
          Layer 1: Border & Body (RoundedBox)
          一番下のレイヤー。これがカードの最大サイズ。
      --------------------------------------------------- */}
      <RoundedBox
        castShadow
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
    </>
  );
};

const CardBaseInner = ({
  baseShape,
  opacity,
}: {
  baseShape: THREE.Shape;
  opacity: number | SpringValue<number>;
}) => {
  const { AREAS: COMPONENTS, COLORS } = CardLayout;
  return (
    <>
      {/* ---------------------------------------------------
          Layer 2: Inner Base (Shape)
          RoundedBoxの上に置く背景。少し小さいので下が縁に見える。
      --------------------------------------------------- */}
      <mesh
        position={COMPONENTS.BASE_INNER.POSITION as [number, number, number]}
      >
        <shapeGeometry args={[baseShape]} />
        <AnimatedMeshStandardMaterial
          color={COLORS.CARD_UI.BASE_BG}
          transparent
          opacity={opacity}
        />
      </mesh>
    </>
  );
};

const CardContentHeader = ({
  card,
  opacity,
  headerShape,
  data,
}: {
  card: CardDefinition & { instanceId: string };
  opacity: SpringValue<number> | number;
  headerShape: THREE.Shape;
  data: UseCardLogicResult["data"];
}) => {
  const { AREAS, COLORS } = CardLayout;
  return (
    <>
      {/* 3.1 Header */}
      <group position={AREAS.HEADER.POSITION as [number, number, number]}>
        <mesh>
          <shapeGeometry args={[headerShape]} />
          <AnimatedMeshBasicMaterial
            color={data.headerColor}
            transparent
            opacity={opacity}
          />
        </mesh>

        <Text
          position={AREAS.TEXT.HEADER.POSITION as [number, number, number]}
          font={AREAS.TEXT.HEADER.FONT}
          fontSize={AREAS.TEXT.HEADER.FONT_SIZE}
          color={COLORS.CARD_UI.TEXT_WHITE}
          fontWeight={AREAS.TEXT.HEADER.FONT_WEIGHT}
          anchorX={AREAS.TEXT.HEADER.ANCHOR_X}
          anchorY={AREAS.TEXT.HEADER.ANCHOR_Y}
          maxWidth={AREAS.BASE_INNER.CONTENT_WIDTH}
        >
          {card.name}
        </Text>
      </group>
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
  const { AREAS: COMPONENTS } = CardLayout;
  return (
    <>
      {/* 3.2 Image area */}
      <animated.mesh
        position={COMPONENTS.IMAGE.POSITION as [number, number, number]}
      >
        <planeGeometry args={COMPONENTS.IMAGE.SIZE} />
        {/* animated.meshStandardMaterialにtextureを渡すと型が深すぎるエラーが出る 
            原因は不明。
            そのため、meshStandardMaterialをそのまま使用する。
            しかしそうするとgroupで囲むと表示されないため、groupでは囲まない。
        */}
        <meshStandardMaterial map={texture} opacity={opacity} />
      </animated.mesh>
    </>
  );
};

const CardContentDescription = ({
  opacity,
  card,
}: {
  opacity: SpringValue<number> | number;
  card: CardDefinition & { instanceId: string };
}) => {
  const { AREAS: COMPONENTS, COLORS } = CardLayout;
  return (
    <>
      {/* 3.3 Description area */}
      <group position={COMPONENTS.DESC.POSITION as [number, number, number]}>
        {/* background */}
        <mesh>
          <planeGeometry args={COMPONENTS.DESC.SIZE} />
          <AnimatedMeshBasicMaterial
            color={COLORS.CARD_UI.DESC_BG}
            transparent
            opacity={opacity}
          />
        </mesh>

        {/* text */}
        <Text
          position={COMPONENTS.TEXT.DESC.POSITION}
          font={COMPONENTS.TEXT.DESC.FONT}
          fontSize={COMPONENTS.TEXT.DESC.FONT_SIZE}
          color={COLORS.CARD_UI.TEXT_BLACK}
          anchorX={COMPONENTS.TEXT.DESC.ANCHOR_X}
          anchorY={COMPONENTS.TEXT.DESC.ANCHOR_Y}
          maxWidth={COMPONENTS.TEXT.DESC.MAX_WIDTH}
          lineHeight={COMPONENTS.TEXT.DESC.LINE_HEIGHT}
          overflowWrap={COMPONENTS.TEXT.DESC.OVERFLOW_WRAP}
        >
          {card.description}
        </Text>
      </group>
    </>
  );
};

const CardOverlayCooldown = ({
  state,
  data,
}: {
  state: UseCardLogicResult["state"];
  data: UseCardLogicResult["data"];
}) => {
  const { AREAS: COMPONENTS, COLORS } = CardLayout;
  return (
    <>
      {/* 3.4 Cooldown overlay */}
      {state.isCooldown && (
        <group position={COMPONENTS.COOLDOWN.POSITION}>
          <mesh>
            <planeGeometry args={COMPONENTS.COOLDOWN.SIZE} />
            <meshBasicMaterial
              color={COMPONENTS.COOLDOWN.COLOR}
              transparent
              opacity={COMPONENTS.COOLDOWN.OPACITY}
            />
          </mesh>

          <Text
            position={COMPONENTS.COOLDOWN.POSITION}
            fontSize={COMPONENTS.TEXT.COOLDOWN.FONT_SIZE}
            color={COLORS.CARD_UI.TEXT_WHITE}
            fontWeight={COMPONENTS.TEXT.COOLDOWN.FONT_WEIGHT}
            anchorX={COMPONENTS.TEXT.COOLDOWN.ANCHOR_X}
            anchorY={COMPONENTS.TEXT.COOLDOWN.ANCHOR_Y}
          >
            {data.cooldownTurns}
          </Text>
        </group>
      )}
    </>
  );
};
