import { animated, SpringValue } from "@react-spring/three";
import { RoundedBox, Text, useTexture } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useUIStore } from "@/core/store/uiStore";
import { useGameQuery } from "@/core/api/queries";
import type { CardDefinition, PlayerType } from "@/shared/types/game-schema";
import { DESIGN } from "@/shared/constants/design-tokens";

// TypeScript の型推論エラー (ts2589) 回避のために any でキャスト
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnimatedMeshStandardMaterial = animated.meshStandardMaterial as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnimatedMeshBasicMaterial = animated.meshBasicMaterial as any;

const { CARD, COLORS } = DESIGN;

interface Card3DProps {
  card: CardDefinition & { instanceId: string };
  player: PlayerType;
  width: number;
  opacity: SpringValue<number> | number;
}

const Card3D: React.FC<Card3DProps> = ({ card, player, width, opacity }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageUrl, setImageUrl] = useState(
    "https://placehold.co/256x160/ccc/999?text=No+Image",
  );

  const { selectCard, deselectCard, selectedCardId, setNotification } =
    useUIStore();
  const activePlayerId = useGameQuery.useActivePlayer();
  const playerState = useGameQuery.usePlayer(player);

  const cooldownInfo = playerState?.cooldownActiveCards.find(
    (c) => c.cardId === card.instanceId,
  );
  const isCooldown = !!cooldownInfo;
  const isSelected = selectedCardId === card.instanceId;
  const isMyTurn = activePlayerId === player;
  const isPlayable = isMyTurn && !isCooldown;

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => setImageUrl(card.imagePath);
    img.src = card.imagePath;
  }, [card.imagePath]);

  const imageTexture = useTexture(imageUrl);

  const handleCardClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!isMyTurn) {
      setNotification("相手のターンです", player);
      return;
    }
    if (isCooldown) {
      setNotification(
        `このカードはあと${cooldownInfo?.turnsRemaining}ターン使用できません。`,
        player,
      );
      return;
    }
    if (isSelected) {
      deselectCard();
      return;
    }
    selectCard(card.instanceId);
  };

  const headerColor = useMemo(() => {
    switch (card.cardType) {
      case "alien":
        return COLORS.CARD_TYPES.ALIEN;
      case "eradication":
        return COLORS.CARD_TYPES.ERADICATION;
      case "recovery":
        return COLORS.CARD_TYPES.RECOVERY;
      default:
        return COLORS.CARD_TYPES.DEFAULT;
    }
  }, [card.cardType]);

  const headerShape = useMemo(() => {
    const shape = new THREE.Shape();
    const w = width * CARD.SCALE.CONTENT_WIDTH_RATIO;
    const h = CARD.HEADER.HEIGHT;
    const topY = CARD.HEIGHT / 2 - CARD.HEADER.TOP_Y_OFFSET;
    const { BEZIER_CONTROL_X_RATIO, BEZIER_TANGENT_X_RATIO } = CARD.HEADER;
    const { HEADER_CURVE_FIX, HEADER_CURVE_PEAK } = CARD.OFFSET;

    shape.moveTo(-w / 2, topY - h);
    shape.lineTo(-w / 2, topY - HEADER_CURVE_FIX);
    shape.bezierCurveTo(
      -w / 2,
      topY,
      -w * BEZIER_CONTROL_X_RATIO,
      topY + HEADER_CURVE_PEAK,
      -w * BEZIER_TANGENT_X_RATIO,
      topY,
    );
    shape.bezierCurveTo(
      0,
      topY - HEADER_CURVE_PEAK,
      w * BEZIER_TANGENT_X_RATIO,
      topY,
      w / 2,
      topY - HEADER_CURVE_FIX,
    );
    shape.lineTo(w / 2, topY - h);
    shape.closePath();
    return shape;
  }, [width]);

  return (
    <animated.group
      onPointerEnter={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (isPlayable) setIsHovered(true);
      }}
      onPointerLeave={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setIsHovered(false);
      }}
      onClick={handleCardClick}
    >
      {/* 1. 外枠 (Border) - Shadow追加 */}
      <RoundedBox
        castShadow
        args={[
          width + CARD.SCALE.BORDER_GROWTH,
          CARD.HEIGHT + CARD.SCALE.BORDER_GROWTH,
          CARD.LAYER_DEPTHS.BORDER,
        ]}
        radius={CARD.RADIUS}
      >
        <AnimatedMeshStandardMaterial
          color={
            isSelected
              ? COLORS.CARD_UI.BORDER_SELECTED
              : isHovered
                ? COLORS.CARD_UI.BORDER_HOVER
                : COLORS.CARD_UI.BORDER_DEFAULT
          }
          emissive={isSelected ? COLORS.CARD_UI.BORDER_SELECTED : "black"}
          emissiveIntensity={isSelected ? 0.5 : 0}
          transparent
          opacity={opacity}
        />
      </RoundedBox>

      {/* 2. ベース面 - Shadow追加 */}
      <RoundedBox
        castShadow
        args={[width, CARD.HEIGHT, CARD.LAYER_DEPTHS.BASE]}
        radius={CARD.RADIUS}
      >
        <AnimatedMeshStandardMaterial
          color={COLORS.CARD_UI.BASE_BG}
          transparent
          opacity={opacity}
        />
      </RoundedBox>

      {/* 3. ヘッダーエリア */}
      <group position={[0, 0, CARD.LAYER_DEPTHS.HEADER]}>
        <mesh>
          <shapeGeometry args={[headerShape]} />
          <AnimatedMeshBasicMaterial
            color={headerColor}
            transparent
            opacity={opacity}
          />
        </mesh>
        <Text
          position={[
            0,
            CARD.HEIGHT * CARD.NAME_TEXT.Y_OFFSET_RATIO -
              CARD.NAME_TEXT.Y_OFFSET_FIXED,
            CARD.OFFSET.Z_HEADER_TEXT,
          ]}
          fontSize={CARD.NAME_TEXT.FONT_SIZE}
          fontWeight="bold"
          color={COLORS.CARD_UI.TEXT_WHITE}
          anchorX="center"
          anchorY="middle"
          maxWidth={width * CARD.SCALE.CONTENT_WIDTH_RATIO}
        >
          {card.name}
        </Text>
        {/* コスト表示 */}
        <group
          position={[
            width * CARD.COST_CIRCLE.X_OFFSET_RATIO - CARD.COST_CIRCLE.Y_OFFSET,
            CARD.HEIGHT / 2 - CARD.COST_CIRCLE.Y_OFFSET,
            0.0001,
          ]}
        >
          <mesh>
            <circleGeometry args={[CARD.COST_CIRCLE.RADIUS, 32]} />
            <AnimatedMeshBasicMaterial
              color={COLORS.CARD_UI.BORDER_DEFAULT}
              opacity={opacity}
            />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={CARD.COST_CIRCLE.TEXT_FONT_SIZE}
            color={COLORS.CARD_UI.TEXT_BLACK}
            fontWeight="bold"
            anchorX="center"
            anchorY="middle"
          >
            {card.cost}
          </Text>
        </group>
      </group>

      {/* 4. 画像エリア */}
      <animated.mesh
        position={[0, CARD.IMAGE_AREA.Y_POSITION, CARD.LAYER_DEPTHS.IMAGE]}
      >
        <planeGeometry
          args={[
            width * CARD.SCALE.CONTENT_WIDTH_RATIO,
            CARD.SCALE.IMAGE_HEIGHT,
          ]}
        />
        <AnimatedMeshStandardMaterial
          map={imageTexture}
          transparent
          opacity={opacity}
        />
      </animated.mesh>

      {/* 5. 説明文エリア - 二重背景の復元 */}
      <group
        position={[
          0,
          CARD.DESCRIPTION_AREA.Y_POSITION,
          CARD.LAYER_DEPTHS.DESCRIPTION,
        ]}
      >
        {/* 白いテキスト背景 */}
        <mesh>
          <planeGeometry
            args={[
              width * CARD.SCALE.CONTENT_WIDTH_RATIO,
              CARD.DESCRIPTION_AREA.HEIGHT,
            ]}
          />
          <AnimatedMeshBasicMaterial
            color={COLORS.CARD_UI.DESC_BG}
            transparent
            opacity={opacity}
          />
        </mesh>
        {/* 背面の装飾（金色の台座） - Legacyデザインの復元 */}
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry
            args={[
              width - 0.15, // Legacy準拠の計算式
              CARD.DESCRIPTION_AREA.BG_HEIGHT,
            ]}
          />
          <AnimatedMeshBasicMaterial
            color={COLORS.CARD_UI.BORDER_DEFAULT}
            transparent
            opacity={opacity}
          />
        </mesh>
        <Text
          position={[
            0,
            CARD.DESCRIPTION_AREA.TEXT_Y_OFFSET,
            CARD.OFFSET.Z_DESC_TEXT,
          ]}
          fontSize={CARD.DESCRIPTION_AREA.TEXT_FONT_SIZE}
          color={COLORS.CARD_UI.TEXT_BLACK}
          anchorX="center"
          anchorY="top"
          maxWidth={width * CARD.SCALE.DESC_WIDTH_RATIO}
          lineHeight={CARD.DESCRIPTION_AREA.LINE_HEIGHT}
          overflowWrap="break-word"
        >
          {card.description}
        </Text>
      </group>

      {/* 6. クールタイムオーバーレイ - 復元 */}
      {isCooldown && (
        <group>
          <mesh position={[0, 0, CARD.LAYER_DEPTHS.COOLDOWN_OVERLAY]}>
            <planeGeometry
              args={[
                width + CARD.SCALE.BORDER_GROWTH,
                CARD.HEIGHT + CARD.SCALE.BORDER_GROWTH,
              ]}
            />
            <meshBasicMaterial color="gray" transparent opacity={0.6} />
          </mesh>
          <Text
            position={[0, 0, CARD.LAYER_DEPTHS.COOLDOWN_TEXT]}
            fontWeight="bold"
            fontSize={0.5}
            color={COLORS.CARD_UI.TEXT_WHITE}
            anchorX="center"
            anchorY="middle"
          >
            {cooldownInfo?.turnsRemaining}
          </Text>
        </group>
      )}
    </animated.group>
  );
};

export default Card3D;
