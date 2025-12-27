import React from "react";
import * as THREE from "three";
import { Group } from "three";
import { useThree } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import { useUIStore } from "@/app/store/useUIStore";
import { CardDefinition } from "@/shared/types/game-schema";

/**
 * カード配置時の「ガイド」となる3Dオブジェクト。
 * マスの上をドラッグして移動させることができます。
 */
const PreviewPiece: React.FC<{
  card: CardDefinition;
  position: { x: number; y: number };
  boardRef: React.RefObject<Group | null>;
}> = ({ card, position, boardRef }) => {
  const { setPreviewPlacement } = useUIStore();
  const { size, camera, raycaster } = useThree();

  // ドラッグ操作による位置の更新ロジック
  const bind = useGesture(
    {
      onDrag: ({ xy: [px, py], event }) => {
        event.stopPropagation();
        if (!boardRef.current) return;

        // ポインター座標を -1 ～ 1 の正規化座標に変換
        const pointer = new THREE.Vector2(
          (px / size.width) * 2 - 1,
          -(py / size.height) * 2 + 1,
        );

        // カメラから盤面に向けてレイを飛ばす
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(
          boardRef.current.children,
          true,
        );

        // ヒットしたオブジェクトからマス情報を取得して座標を更新
        const intersectedCell = intersects.find((i) =>
          i.object.name.startsWith("cell-plane"),
        )?.object.parent?.userData?.cell;

        if (intersectedCell) {
          setPreviewPlacement({ x: intersectedCell.x, y: intersectedCell.y });
        }
      },
    },
    { drag: { filterTaps: true } },
  );

  // カードの種類に応じた色分け
  const pieceColor =
    card.cardType === "alien"
      ? "#C62828"
      : card.cardType === "eradication"
        ? "#4a82a2"
        : "#579d5b";

  return (
    <group
      position={[
        (position.x - (7 - 1) / 2) * 1.0,
        0.1,
        (position.y - (10 - 1) / 2) * 1.0,
      ]}
      {...bind()}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.9, 0.9, 0.2]} />
        <meshStandardMaterial
          color={pieceColor}
          transparent
          opacity={0.7}
          emissive="#FFD700" // 黄色の発光（ガイド）
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

export default PreviewPiece;
