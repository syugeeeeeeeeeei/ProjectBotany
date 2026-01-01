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
  width?: number; // カード全体の幅 (RoundedBoxの幅)
  opacity: SpringValue<number> | number;
}

const Card3D: React.FC<Card3DProps> = ({
  card,
  player,
  width = CardLayout.SIZE.WIDTH,
  opacity,
}) => {
  const { state, data, handlers } = useCardLogic({ card, player });
  const texture = useTexture(data.textureUrl);

  // 定数ショートカット
  const { SIZE, Z_OFFSETS, RATIOS, POS, COLORS } = CardLayout;

  // ジオメトリ生成

  // 1. Base形状: 外枠(width)から、縁の太さ分だけ小さくする
  const baseWidth = width - SIZE.BORDER_THICKNESS * 2;
  const baseHeight = SIZE.HEIGHT - SIZE.BORDER_THICKNESS * 2;
  // 角丸半径も少し調整すると自然だが、ここではシンプルにSIZE.RADIUSを使用（または少し小さくする）
  const baseRadius = Math.max(0, SIZE.RADIUS - SIZE.BORDER_THICKNESS / 2);

  const baseShape = useMemo(
    () => createRoundedRectShape(baseWidth, baseHeight, baseRadius),
    [baseWidth, baseHeight, baseRadius],
  );

  const headerShape = useMemo(
    () => createHeaderShape(width, SIZE.HEIGHT),
    [width, SIZE.HEIGHT],
  );

  // Z座標の基準
  // RoundedBoxの中心が(0,0,0)なので、表面のZは THICKNESS / 2
  const surfaceZ = SIZE.THICKNESS / 2;

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
        args={[SIZE.WIDTH, SIZE.HEIGHT, SIZE.THICKNESS]}
        radius={SIZE.RADIUS}
      >
        <AnimatedMeshStandardMaterial
          color={COLORS.BORDER} // #B8860B
          emissive={state.isSelected ? COLORS.BORDER : "black"}
          emissiveIntensity={state.isSelected ? 0.5 : 0}
          transparent
          opacity={opacity}
        />
      </RoundedBox>
      {/* ---------------------------------------------------
          Layer 2: Base (Plane/Shape)
          RoundedBoxの上に置く背景。少し小さいので下が縁に見える。
      --------------------------------------------------- */}
      <mesh position={[0, 0, surfaceZ + Z_OFFSETS.BASE]}>
        <shapeGeometry args={[baseShape]} />
        <AnimatedMeshStandardMaterial
          color={COLORS.CARD_UI.BASE_BG}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* ---------------------------------------------------
          Layer 3: Contents (Plane)
          Baseの上に配置する要素群
      --------------------------------------------------- */}

      {/* 3.1 ヘッダー */}
      <group position={[0, 0, surfaceZ + Z_OFFSETS.HEADER_BG]}>
        <mesh>
          <shapeGeometry args={[headerShape]} />
          <AnimatedMeshBasicMaterial
            color={data.headerColor}
            transparent
            opacity={opacity}
          />
        </mesh>
        <Text
          position={[0, SIZE.HEIGHT / 2 - POS.NAME_Y_FROM_TOP, Z_OFFSETS.TEXT]}
          fontSize={0.14}
          fontWeight="bold"
          color={COLORS.CARD_UI.TEXT_WHITE}
          anchorX="center"
          anchorY="middle"
          maxWidth={width * RATIOS.CONTENT_WIDTH}
        >
          {card.name}
        </Text>
      </group>

      {/* 3.2 画像エリア */}
      <animated.mesh position={[0, 0.4, surfaceZ + Z_OFFSETS.IMAGE_BG]}>
        <planeGeometry
          args={[width * RATIOS.CONTENT_WIDTH, RATIOS.IMAGE_HEIGHT]}
        />
        <AnimatedMeshStandardMaterial
          map={texture}
          transparent
          opacity={opacity}
        />
      </animated.mesh>

      {/* 3.3 説明文エリア */}
      <group position={[0, POS.DESC_Y, surfaceZ + Z_OFFSETS.DESC_BG]}>
        {/* 背景 */}
        <mesh>
          <planeGeometry args={[width * RATIOS.CONTENT_WIDTH, 1.15]} />
          <AnimatedMeshBasicMaterial
            color={COLORS.CARD_UI.DESC_BG}
            transparent
            opacity={opacity}
          />
        </mesh>
        {/* テキスト */}
        <Text
          position={[0, POS.DESC_TEXT_Y_OFFSET, Z_OFFSETS.TEXT]}
          fontSize={0.095}
          color={COLORS.CARD_UI.TEXT_BLACK}
          anchorX="center"
          anchorY="top"
          maxWidth={width * RATIOS.DESC_WIDTH}
          lineHeight={1.2}
        >
          {card.description}
        </Text>
      </group>

      {/* 3.4 クールタイムオーバーレイ */}
      {state.isCooldown && (
        <group position={[0, 0, surfaceZ + Z_OFFSETS.OVERLAY]}>
          <mesh>
            {/* 全体を覆うため width を使用 */}
            <planeGeometry args={[width, SIZE.HEIGHT]} />
            <meshBasicMaterial color="gray" transparent opacity={0.6} />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontWeight="bold"
            fontSize={0.5}
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
