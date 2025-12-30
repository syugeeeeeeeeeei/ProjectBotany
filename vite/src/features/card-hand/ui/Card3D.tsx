import { animated, useSpring } from "@react-spring/three";
import { RoundedBox, Text, useTexture } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useUIStore } from "@/core/store/uiStore";
import { useGameQuery } from "@/core/api/queries";
import type { CardDefinition, PlayerType } from "@/shared/types/game-schema";

// --- 定数定義 ---
const PLACEHOLDER_IMAGE_URL =
  "https://placehold.co/256x160/ccc/999?text=No+Image";
const CARD_LAYOUT = {
  HEIGHT: 2.7,
  RADIUS: 0.04,
  BASE_DEPTH: 0.1,
  LAYER_DEPTHS: {
    BORDER: 0.08,
    BASE: 0.1,
    HEADER: 0.051,
    IMAGE: 0.053,
    DESCRIPTION: 0.0515,
    COOLDOWN_OVERLAY: 0.06,
    COOLDOWN_TEXT: 0.07,
  },
  HEADER: {
    HEIGHT: 0.43,
    TOP_Y_OFFSET: 0.05,
    BEZIER_CONTROL_X_RATIO: 1 / 3,
    BEZIER_TANGENT_X_RATIO: 1 / 6,
  },
  COST_CIRCLE: {
    RADIUS: 0.13,
    X_OFFSET_RATIO: 0.5,
    Y_OFFSET: 0.15,
    TEXT_FONT_SIZE: 0.16,
  },
  IMAGE_AREA: { Y_POSITION: 0.4 },
  DESCRIPTION_AREA: {
    Y_POSITION: -0.68,
    HEIGHT: 1.15,
    BG_HEIGHT: 1.2,
    TEXT_Y_OFFSET: 0.52,
    TEXT_FONT_SIZE: 0.095,
    LINE_HEIGHT: 1.2,
  },
  NAME_TEXT: { Y_OFFSET_RATIO: 0.5, Y_OFFSET_FIXED: 0.3, FONT_SIZE: 0.14 },
};

interface Card3DProps {
  card: CardDefinition & { instanceId: string };
  position?: [number, number, number];
  player: PlayerType;
  width: number;
  opacity: number;
}

const Card3D: React.FC<Card3DProps> = ({ card, player, width, opacity }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageUrl, setImageUrl] = useState(PLACEHOLDER_IMAGE_URL);

  const { selectCard, deselectCard, selectedCardId, setNotification } =
    useUIStore();
  const activePlayerId = useGameQuery.useActivePlayer();
  const playerState = useGameQuery.usePlayer(player);

  const CARD_WIDTH = width;
  const cooldownInfo = playerState?.cooldownActiveCards.find(
    (c) => c.cardId === card.instanceId,
  );
  const isCooldown = !!cooldownInfo;
  const isSelected = selectedCardId === card.instanceId;
  const isMyTurn = activePlayerId === player;
  const isPlayable = isMyTurn && !isCooldown;

  const { scale } = useSpring({
    scale: isSelected ? 1.1 : 1,
    config: { tension: 300, friction: 30 },
  });

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => setImageUrl(card.imagePath);
    img.onerror = () => setImageUrl(PLACEHOLDER_IMAGE_URL);
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
    if (isSelected) deselectCard();
    else selectCard(card.instanceId);
  };

  const headerColor = useMemo(() => {
    switch (card.cardType) {
      case "alien":
        return "#A00000";
      case "eradication":
        return "#005080";
      case "recovery":
        return "#207030";
      default:
        return "#555555";
    }
  }, [card.cardType]);

  const headerShape = useMemo(() => {
    const shape = new THREE.Shape();
    const w = CARD_WIDTH * 0.9;
    const h = CARD_LAYOUT.HEADER.HEIGHT;
    const topY = CARD_LAYOUT.HEIGHT / 2 - CARD_LAYOUT.HEADER.TOP_Y_OFFSET;
    shape.moveTo(-w / 2, topY - h);
    shape.lineTo(-w / 2, topY - 0.1);
    shape.bezierCurveTo(
      -w / 2,
      topY,
      -w * CARD_LAYOUT.HEADER.BEZIER_CONTROL_X_RATIO,
      topY + 0.05,
      -w * CARD_LAYOUT.HEADER.BEZIER_TANGENT_X_RATIO,
      topY,
    );
    shape.bezierCurveTo(
      0,
      topY - 0.05,
      w * CARD_LAYOUT.HEADER.BEZIER_TANGENT_X_RATIO,
      topY,
      w / 2,
      topY - 0.1,
    );
    shape.lineTo(w / 2, topY - h);
    shape.closePath();
    return shape;
  }, [CARD_WIDTH]);

  return (
    <animated.group
      scale={scale}
      onPointerEnter={(e) => {
        e.stopPropagation();
        if (isPlayable) setIsHovered(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setIsHovered(false);
      }}
      onClick={handleCardClick}
    >
      {/* Background & Border */}
      <RoundedBox
        args={[
          CARD_WIDTH + 0.1,
          CARD_LAYOUT.HEIGHT + 0.1,
          CARD_LAYOUT.LAYER_DEPTHS.BORDER,
        ]}
        radius={CARD_LAYOUT.RADIUS}
      >
        <animated.meshStandardMaterial
          color={isSelected ? "#FFD700" : isHovered ? "#FAD02C" : "#B8860B"}
          emissive={isSelected ? "#FFD700" : "black"}
          emissiveIntensity={isSelected ? 0.5 : 0}
          transparent
          opacity={opacity}
        />
      </RoundedBox>
      <RoundedBox
        args={[CARD_WIDTH, CARD_LAYOUT.HEIGHT, CARD_LAYOUT.LAYER_DEPTHS.BASE]}
        radius={CARD_LAYOUT.RADIUS}
      >
        <animated.meshStandardMaterial
          color="#F5EFE6"
          transparent
          opacity={opacity}
        />
      </RoundedBox>

      {/* Header & Text */}
      <group position={[0, 0, CARD_LAYOUT.LAYER_DEPTHS.HEADER]}>
        <mesh>
          <shapeGeometry args={[headerShape]} />
          <animated.meshBasicMaterial
            color={headerColor}
            transparent
            opacity={opacity}
          />
        </mesh>
        <Text
          position={[
            0,
            CARD_LAYOUT.HEIGHT * CARD_LAYOUT.NAME_TEXT.Y_OFFSET_RATIO -
              CARD_LAYOUT.NAME_TEXT.Y_OFFSET_FIXED,
            0.01,
          ]}
          fontSize={CARD_LAYOUT.NAME_TEXT.FONT_SIZE}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={CARD_WIDTH * 0.9}
        >
          {card.name}
        </Text>
        <group
          position={[
            CARD_WIDTH * CARD_LAYOUT.COST_CIRCLE.X_OFFSET_RATIO -
              CARD_LAYOUT.COST_CIRCLE.Y_OFFSET,
            CARD_LAYOUT.HEIGHT / 2 - CARD_LAYOUT.COST_CIRCLE.Y_OFFSET,
            0.0001,
          ]}
        >
          <mesh>
            <circleGeometry args={[CARD_LAYOUT.COST_CIRCLE.RADIUS, 32]} />
            <animated.meshBasicMaterial color="#B8860B" opacity={opacity} />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={CARD_LAYOUT.COST_CIRCLE.TEXT_FONT_SIZE}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            {card.cost}
          </Text>
        </group>
      </group>

      {/* Image */}
      <animated.mesh
        position={[
          0,
          CARD_LAYOUT.IMAGE_AREA.Y_POSITION,
          CARD_LAYOUT.LAYER_DEPTHS.IMAGE,
        ]}
      >
        <planeGeometry args={[CARD_WIDTH * 0.9, 0.9]} />
        <meshStandardMaterial map={imageTexture} opacity={opacity} />
      </animated.mesh>

      {/* Description */}
      <group
        position={[
          0,
          CARD_LAYOUT.DESCRIPTION_AREA.Y_POSITION,
          CARD_LAYOUT.LAYER_DEPTHS.DESCRIPTION,
        ]}
      >
        <Text
          position={[0, CARD_LAYOUT.DESCRIPTION_AREA.TEXT_Y_OFFSET, 0.01]}
          fontSize={CARD_LAYOUT.DESCRIPTION_AREA.TEXT_FONT_SIZE}
          color="black"
          anchorX="center"
          anchorY="top"
          maxWidth={CARD_WIDTH * 0.8}
          lineHeight={CARD_LAYOUT.DESCRIPTION_AREA.LINE_HEIGHT}
        >
          {card.description}
        </Text>
      </group>
    </animated.group>
  );
};
export default Card3D;
