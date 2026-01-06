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
  isDimmed: boolean;
}

const Card3D: React.FC<Card3DProps> = ({ card, player, isDimmed }) => {
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
      />
      <CardBaseInner baseShape={baseShape} />
      <CardContentHeader card={card} headerShape={headerShape} data={data} />
      <CardContentCost card={card} />
      <CardContentImage textureUrl={data.textureUrl} />
      <CardContentDescription card={card} />
      {data.hasUsageLimit && (
        <CardContentUsageLimit remainingUses={data.remainingUses} />
      )}
      <CardOverlayCooldown
        isCooldown={state.isCooldown}
        cooldownRounds={data.cooldownRounds}
      />
      <CardOverlayUsageLimit isUsable={state.isUsable} />
      <CardOverlayDim isDimmed={isDimmed} />
    </animated.group>
  );
};

export default Card3D;

// --- Sub Components ---

const CardBase = ({
  isSelected,
  borderStateColor,
}: {
  isSelected: boolean;
  borderStateColor: string;
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
        // ✨ 修正: transparent を削除 (不透明化)
      />
    </RoundedBox>
  );
};

const CardBaseInner = ({ baseShape }: { baseShape: THREE.Shape }) => (
  <mesh position={CardLayout.AREAS.BASE_INNER.POSITION}>
    <shapeGeometry args={[baseShape]} />
    <AnimatedMeshStandardMaterial
      color={CardLayout.COLORS.CARD_UI.BASE_BG}
      // ✨ 修正: transparent を削除
    />
  </mesh>
);

const CardContentHeader = ({
  card,
  headerShape,
  data,
}: {
  card: CardDefinition;
  headerShape: THREE.Shape;
  data: UseCardLogicResult["data"];
}) => (
  <>
    <mesh position={CardLayout.AREAS.HEADER.POSITION}>
      <shapeGeometry args={[headerShape]} />
      <AnimatedMeshBasicMaterial color={data.headerColor} />
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

const CardContentCost = ({ card }: { card: CardDefinition }) => (
  <>
    <mesh position={CardLayout.AREAS.COST.POSITION}>
      <circleGeometry args={[CardLayout.AREAS.COST.RADIUS, 32]} />
      <AnimatedMeshBasicMaterial
        color={CardLayout.COLORS.BORDER}
        // ✨ 修正: transparent を削除
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

const CardContentUsageLimit = ({
  remainingUses,
}: {
  remainingUses?: number;
}) => (
  <>
    <mesh position={CardLayout.AREAS.USAGE_LIMIT.POSITION}>
      <circleGeometry args={[CardLayout.AREAS.USAGE_LIMIT.RADIUS, 32]} />
      <AnimatedMeshBasicMaterial
        color={CardLayout.COLORS.USAGE_LIMIT_BG}
        // ✨ 修正: transparent を削除
      />
    </mesh>
    <Text
      position={CardLayout.AREAS.TEXT.USAGE_LIMIT.POSITION}
      fontSize={CardLayout.AREAS.TEXT.USAGE_LIMIT.FONT_SIZE}
      font={CardLayout.AREAS.TEXT.USAGE_LIMIT.FONT}
      color={CardLayout.AREAS.TEXT.USAGE_LIMIT.COLOR}
      anchorX="center"
      anchorY="middle"
    >
      {remainingUses}
    </Text>
  </>
);

const CardContentImage = ({ textureUrl }: { textureUrl: string }) => {
  const texture = useTexture(textureUrl);
  return (
    <animated.mesh position={CardLayout.AREAS.IMAGE.POSITION}>
      <planeGeometry args={CardLayout.AREAS.IMAGE.SIZE} />
      <meshStandardMaterial map={texture} />
      {/* ✨ 修正: 画像にアルファチャンネルがない場合はtransparent不要。
          もし透過PNGを使うならtransparent={true}が必要ですが、
          カードイラストなら通常は不透明でOKと判断して削除。
          必要に応じて戻してください。 */}
    </animated.mesh>
  );
};

const CardContentDescription = ({ card }: { card: CardDefinition }) => (
  <>
    <mesh position={CardLayout.AREAS.DESC.POSITION}>
      <planeGeometry args={CardLayout.AREAS.DESC.SIZE} />
      <AnimatedMeshBasicMaterial
        color={CardLayout.COLORS.CARD_UI.DESC_BG}
        // ✨ 修正: transparent を削除
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
}: {
  isCooldown: boolean;
  cooldownRounds?: number;
}) => {
  if (!isCooldown) return null;
  return (
    <>
      <mesh position={CardLayout.AREAS.COOLDOWN.POSITION}>
        <planeGeometry args={CardLayout.AREAS.COOLDOWN.SIZE} />
        <meshStandardMaterial
          color={CardLayout.AREAS.COOLDOWN.COLOR}
          transparent
          opacity={CardLayout.AREAS.COOLDOWN.OPACITY}
          roughness={0.1}
          metalness={0.2}
          depthWrite={false} // ✨ オーバーレイなのでdepthWriteを切っておくのが無難
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

const CardOverlayUsageLimit = ({ isUsable }: { isUsable: boolean }) => {
  if (isUsable) return null;
  return (
    <mesh position={CardLayout.AREAS.COOLDOWN.POSITION}>
      <planeGeometry args={CardLayout.AREAS.COOLDOWN.SIZE} />
      <meshBasicMaterial
        color="#330000"
        transparent
        opacity={0.7}
        depthWrite={false} // ✨ オーバーレイなのでdepthWriteを切る
      />
    </mesh>
  );
};

// ✨ Dim表現用のオーバーレイ
const CardOverlayDim = ({ isDimmed }: { isDimmed: boolean }) => {
  if (!isDimmed) return null;
  return (
    <mesh position={CardLayout.AREAS.DIM_OVERLAY.POSITION}>
      <planeGeometry args={CardLayout.AREAS.DIM_OVERLAY.SIZE} />
      <meshBasicMaterial
        color={CardLayout.AREAS.DIM_OVERLAY.COLOR}
        transparent
        opacity={CardLayout.AREAS.DIM_OVERLAY.OPACITY}
        depthWrite={false} // ✨ 修正: これを追加して深度書き込みを無効化
      />
    </mesh>
  );
};
