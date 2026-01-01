// src/features/cards/components/Card3D.tsx
import React, { useMemo } from "react";
import { animated, SpringValue } from "@react-spring/three";
import { RoundedBox, Text, useTexture } from "@react-three/drei";
import type { CardDefinition, PlayerType } from "@/shared/types/game-schema";

import { useCardLogic } from "../hooks/useCardLogic";
import { CardLayout } from "../domain/cardLayout";
import {
  createHeaderShape,
  createRoundedRectShape,
} from "./parts/cardGeometries";

// 型定義の回避
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnimatedMeshStandardMaterial = animated.meshStandardMaterial as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnimatedMeshBasicMaterial = animated.meshBasicMaterial as any;

interface Card3DProps {
  card: CardDefinition & { instanceId: string };
  player: PlayerType;
  opacity: SpringValue<number> | number;
}

/**
 * Card3D
 * - 静的カード運用前提：外部から幅は受け取らず、CardLayout.BASE.WIDTH を採用する。
 * - 将来可変にしたい場合は CardLayout.calc(width) に width を渡すだけで対応できる。
 */
const Card3D: React.FC<Card3DProps> = ({ card, player, opacity }) => {
  const { state, data, handlers } = useCardLogic({ card, player });
  const texture = useTexture(data.textureUrl);

  // Shortcuts
  const { BASE, Z, RATIOS, COMPONENTS, COLORS } = CardLayout;

  // Static width (no props)
  const cardWidth = BASE.WIDTH;

  // Derived values
  const { surfaceZ, innerWidth, innerHeight, innerCornerRadius } =
    CardLayout.calc(cardWidth);

  // Shapes
  const baseShape = useMemo(
    () => createRoundedRectShape(innerWidth, innerHeight, innerCornerRadius),
    [innerWidth, innerHeight, innerCornerRadius],
  );

  const headerShape = useMemo(
    () => createHeaderShape(cardWidth, BASE.HEIGHT),
    [cardWidth, BASE.HEIGHT],
  );

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
      <RoundedBox
        castShadow
        args={[
          COMPONENTS.BORDER_BOX.WIDTH,
          COMPONENTS.BORDER_BOX.HEIGHT,
          COMPONENTS.BORDER_BOX.THICKNESS,
        ]}
        radius={BASE.CORNER_RADIUS}
      >
        <AnimatedMeshStandardMaterial
          color={COLORS.BORDER}
          emissive={state.isSelected ? COLORS.BORDER : "black"}
          emissiveIntensity={state.isSelected ? 0.5 : 0}
          transparent
          opacity={opacity}
        />
      </RoundedBox>

      {/* ---------------------------------------------------
          Layer 2: Inner Base (Shape)
          RoundedBoxの上に置く背景。少し小さいので下が縁に見える。
      --------------------------------------------------- */}
      <mesh position={[0, 0, surfaceZ + Z.BASE_BG]}>
        <shapeGeometry args={[baseShape]} />
        <AnimatedMeshStandardMaterial
          color={COLORS.CARD_UI.BASE_BG}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* ---------------------------------------------------
          Layer 3: Contents
      --------------------------------------------------- */}

      {/* 3.1 Header */}
      <group position={[0, 0, surfaceZ + Z.HEADER_BG]}>
        <mesh>
          <shapeGeometry args={[headerShape]} />
          <AnimatedMeshBasicMaterial
            color={data.headerColor}
            transparent
            opacity={opacity}
          />
        </mesh>

        <Text
          position={[
            0,
            BASE.HEIGHT / 2 - COMPONENTS.TEXT.NAME.Y_FROM_TOP,
            Z.TEXT,
          ]}
          fontSize={COMPONENTS.TEXT.NAME.FONT_SIZE}
          fontWeight="bold"
          color={COLORS.CARD_UI.TEXT_WHITE}
          anchorX="center"
          anchorY="middle"
          maxWidth={cardWidth * RATIOS.CONTENT_WIDTH}
        >
          {card.name}
        </Text>
      </group>

      {/* 3.2 Image area */}
      <animated.mesh
        position={[0, COMPONENTS.IMAGE.GROUP_Y, surfaceZ + Z.IMAGE_BG]}
      >
        <planeGeometry
          args={[cardWidth * RATIOS.CONTENT_WIDTH, RATIOS.IMAGE_PLANE_HEIGHT]}
        />
        <AnimatedMeshStandardMaterial
          map={texture}
          transparent
          opacity={opacity}
        />
      </animated.mesh>

      {/* 3.3 Description area */}
      <group position={[0, COMPONENTS.TEXT.DESC.GROUP_Y, surfaceZ + Z.DESC_BG]}>
        {/* background */}
        <mesh>
          <planeGeometry
            args={[
              cardWidth * RATIOS.CONTENT_WIDTH,
              COMPONENTS.DESC_PANEL.PLANE_HEIGHT,
            ]}
          />
          <AnimatedMeshBasicMaterial
            color={COLORS.CARD_UI.DESC_BG}
            transparent
            opacity={opacity}
          />
        </mesh>

        {/* text */}
        <Text
          position={[0, COMPONENTS.TEXT.DESC.TEXT_Y_OFFSET, Z.TEXT]}
          fontSize={COMPONENTS.TEXT.DESC.FONT_SIZE}
          color={COLORS.CARD_UI.TEXT_BLACK}
          anchorX="center"
          anchorY="top"
          maxWidth={cardWidth * RATIOS.DESC_WIDTH}
          lineHeight={COMPONENTS.TEXT.DESC.LINE_HEIGHT}
        >
          {card.description}
        </Text>
      </group>

      {/* 3.4 Cooldown overlay */}
      {state.isCooldown && (
        <group position={[0, 0, surfaceZ + Z.OVERLAY]}>
          <mesh>
            <planeGeometry args={[cardWidth, BASE.HEIGHT]} />
            <meshBasicMaterial
              color={COMPONENTS.OVERLAY.COLOR}
              transparent
              opacity={COMPONENTS.OVERLAY.OPACITY}
            />
          </mesh>

          <Text
            position={[0, 0, COMPONENTS.TEXT.COOLDOWN.Z_IN_OVERLAY]}
            fontWeight="bold"
            fontSize={COMPONENTS.TEXT.COOLDOWN.FONT_SIZE}
            color={COLORS.CARD_UI.TEXT_WHITE}
            anchorX="center"
            anchorY="middle"
          >
            {data.cooldownTurns}
          </Text>
        </group>
      )}
    </animated.group>
  );
};

export default Card3D;
