import { animated, useSpring } from "@react-spring/three";
import { RoundedBox, Text, useTexture } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

/**
 * 3D カードコンポーネント (Card3D)
 * 
 * 【動機】
 * 個々のカードを 3D オブジェクトとして表現し、物理的なカードに触れているような
 * 視覚体験を提供するためです。情報の階層（タイトル、画像、コスト、説明文）を 3D 空間の
 * 厚み（Z方向のオフセット）で表現し、リッチな質感を追求しています。
 *
 * 【恩恵】
 * - `react-spring` による滑らかなアニメーション（ホバー時の拡大、選択時の挙動）が可能です。
 * - クールタイム中のグレーアウト表示や、所属プレイヤーに応じたヘッダー色など、
 *   動的な状態変化を視覚的にフィードバックできます。
 * - 3D 空間でのレイヤー構造により、文字の重なりや影を美しく表現できます。
 *
 * 【使用法】
 * `Hand3D` コンポーネント内で使用され、`CardDefinition` データを受け取って描画されます。
 * クリックされると `useUIStore` を通じてカードの選択状態を更新します。
 */
import { useUIStore } from "../../../app/store/useUIStore";
import { useGameStore } from "../../../app/store/useGameStore";
import type {
  CardDefinition,
  PlayerType,
} from "../../../shared/types/game-schema";

// --- 定数定義 ---
const PLACEHOLDER_IMAGE_URL =
  "https://placehold.co/256x160/ccc/999?text=No+Image";
const CARD_LAYOUT = {
  HEIGHT: 2.7,
  RADIUS: 0.04,
  BASE_DEPTH: 0.1,
  LAYER_DEPTHS: {
    BORDER: 0.1 - 0.02,
    BASE: 0.1,
    HEADER: 0.1 / 2 + 0.001,
    IMAGE: 0.1 / 2 + 0.003,
    DESCRIPTION: 0.1 / 2 + 0.0015,
    COOLDOWN_OVERLAY: 0.1 / 2 + 0.01,
    COOLDOWN_TEXT: 0.1 / 2 + 0.02,
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
  IMAGE_AREA: {
    Y_POSITION: 0.4,
  },
  DESCRIPTION_AREA: {
    Y_POSITION: -0.68,
    HEIGHT: 1.15,
    BG_HEIGHT: 1.2,
    TEXT_Y_OFFSET: 0.52,
    TEXT_FONT_SIZE: 0.095,
    LINE_HEIGHT: 1.2,
  },
  NAME_TEXT: {
    Y_OFFSET_RATIO: 0.5,
    Y_OFFSET_FIXED: 0.3,
    FONT_SIZE: 0.14,
  },
};

interface Card3DProps {
  card: CardDefinition & { instanceId: string };
  position: [number, number, number];
  player: PlayerType;
  width: number;
  opacity: any;
}

const Card3D: React.FC<Card3DProps> = ({ card, player, width, opacity }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageUrl, setImageUrl] = useState(PLACEHOLDER_IMAGE_URL);

  // UI状態は useUIStore から
  const { selectCard, deselectCard, selectedCardId, setNotification } =
    useUIStore();

  // ゲームの実データは useGameStore から
  const { activePlayerId, playerStates } = useGameStore();

  const CARD_WIDTH = width;
  const cooldownInfo = playerStates[player]?.cooldownActiveCards.find(
    (c: { cardId: string; turnsRemaining: number }) =>
      c.cardId === card.instanceId,
  );
  const isCooldown = !!cooldownInfo;
  const isSelected = selectedCardId === card.instanceId;
  const isMyTurn = activePlayerId === player;
  const isPlayable = isMyTurn && !isCooldown;

  const { scale } = useSpring({
    scale: isSelected ? 1.1 : 1,
    config: { tension: 300, friction: 30 },
  });

  // 画像のプリロードと読み込みエラー時のフォールバック処理
  // 外部URLの画像が読み込めない場合でも、プレースホルダーを表示してUIが崩れるのを防ぐために必要です
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => setImageUrl(card.imagePath);
    img.onerror = () => setImageUrl(PLACEHOLDER_IMAGE_URL);
    img.src = card.imagePath;
  }, [card.imagePath]);

  const imageTexture = useTexture(imageUrl);

  /**
   * カードクリック時のハンドラ
   * 手番の確認、クールタイムの判定、および選択状態のトグルを行うために必要です
   */
  const handleCardClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation(); // 他のオブジェクト（盤面など）へのクリック伝播を防ぐ

    if (!isMyTurn) {
      setNotification("相手のターンです", player);
      return;
    }
    if (isCooldown) {
      setNotification(
        `このカードはあと${cooldownInfo.turnsRemaining}ターン使用できません。`,
        player,
      );
      return;
    }

    if (isSelected) {
      deselectCard();
    } else {
      selectCard(card.instanceId);
    }
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

  // ヘッダー（タイトルエリア）の形状を Bezier 曲線を用いて生成
  // カードの個性を出すための独自の曲線デザインを描画するために必要です
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
      <RoundedBox
        castShadow
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
        castShadow
        args={[CARD_WIDTH, CARD_LAYOUT.HEIGHT, CARD_LAYOUT.LAYER_DEPTHS.BASE]}
        radius={CARD_LAYOUT.RADIUS}
      >
        <animated.meshStandardMaterial
          color="#F5EFE6"
          transparent
          opacity={opacity}
        />
      </RoundedBox>
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
          fontWeight={"bold"}
          color="white"
          font="MPLUS1p-Bold.ttf"
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
            font="MPLUS1p-Bold.ttf"
            fontWeight="bold"
            anchorX="center"
            anchorY="middle"
          >
            {card.cost}
          </Text>
        </group>
      </group>
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
      <group
        position={[
          0,
          CARD_LAYOUT.DESCRIPTION_AREA.Y_POSITION,
          CARD_LAYOUT.LAYER_DEPTHS.DESCRIPTION,
        ]}
      >
        <mesh>
          <planeGeometry
            args={[CARD_WIDTH * 0.9, CARD_LAYOUT.DESCRIPTION_AREA.HEIGHT]}
          />
          <animated.meshBasicMaterial
            color="white"
            transparent
            opacity={opacity}
          />
        </mesh>
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry
            args={[CARD_WIDTH - 0.15, CARD_LAYOUT.DESCRIPTION_AREA.BG_HEIGHT]}
          />
          <animated.meshBasicMaterial
            color="#B8860B"
            transparent
            opacity={opacity}
          />
        </mesh>
        <Text
          position={[0, CARD_LAYOUT.DESCRIPTION_AREA.TEXT_Y_OFFSET, 0.01]}
          fontSize={CARD_LAYOUT.DESCRIPTION_AREA.TEXT_FONT_SIZE}
          font="MPLUS1p-Regular.ttf"
          color="black"
          anchorX="center"
          anchorY="top"
          maxWidth={CARD_WIDTH * 0.8}
          lineHeight={CARD_LAYOUT.DESCRIPTION_AREA.LINE_HEIGHT}
          overflowWrap="break-word"
        >
          {card.description}
        </Text>
      </group>
      {isCooldown && (
        <group>
          <mesh position={[0, 0, CARD_LAYOUT.LAYER_DEPTHS.COOLDOWN_OVERLAY]}>
            <planeGeometry
              args={[CARD_WIDTH + 0.1, CARD_LAYOUT.HEIGHT + 0.1]}
            />
            <meshBasicMaterial color="gray" transparent opacity={0.6} />
          </mesh>
          <Text
            position={[0, 0, CARD_LAYOUT.LAYER_DEPTHS.COOLDOWN_TEXT]}
            font="MPLUS1p-Bold.ttf"
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {cooldownInfo.turnsRemaining}
          </Text>
        </group>
      )}
    </animated.group>
  );
};

export default Card3D;
