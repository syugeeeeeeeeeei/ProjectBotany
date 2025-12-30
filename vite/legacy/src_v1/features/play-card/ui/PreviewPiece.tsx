import React from "react";
import * as THREE from "three";
import { Group } from "three";
import { useThree } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import { useUIStore } from "@/app/store/useUIStore";
import { CardDefinition } from "@/shared/types/game-schema";

/**
 * カード配置ガイド（PreviewPiece）
 * 
 * 【動機】
 * 手札から選択されたカードを盤面のどこに置こうとしているかを、
 * フィジカルな駒のような 3D オブジェクトとして表現するためです。
 * ユーザーが盤面上をなぞる（ドラッグ）ことで、駒がマス目に吸着（スナップ）して
 * 移動する体験を提供します。
 *
 * 【恩恵】
 * - `useGesture` と `Raycaster` を組み合わせることで、3D 空間上の任意の場所への
 *   ポインティングを 2D のマス目座標（x, y）へと変換できます。
 * - 透明度と発光（Emissive）を伴う 3D 表現により、検討中であることを直感的に伝えます。
 *
 * 【使用法】
 * `InteractionRegistry.getGlobalComponents` を通じて、盤面上に描画されます。
 */
const PreviewPiece: React.FC<{
  card: CardDefinition;
  position: { x: number; y: number };
  boardRef: React.RefObject<Group | null>;
}> = ({ card, position, boardRef }) => {
  const { setPreviewPlacement } = useUIStore();
  const { size, camera, raycaster } = useThree();

  // ドラッグ操作による位置の更新ロジック
  /**
   * ドラッグ操作のバインド設定
   * 3Dシーン上のポインター位置をマス目座標に変換し、配置プレビューを更新するために必要です
   */
  const bind = useGesture(
    {
      onDrag: ({ xy: [px, py], event }) => {
        event.stopPropagation();
        if (!boardRef.current) return;

        // 1. スクリーン座標（ピクセル）を正規化デバイス座標（-1 ～ 1）に変換
        const pointer = new THREE.Vector2(
          (px / size.width) * 2 - 1,
          -(py / size.height) * 2 + 1,
        );

        // 2. カメラからのレイ（光線）をセットし、盤面オブジェクトとの衝突判定を行う
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(
          boardRef.current.children,
          true,
        );

        // 3. 衝突したオブジェクトの中から「マス目（cell-plane）」を探し、その座標を取得
        const intersectedCell = intersects.find((i) =>
          i.object.name.startsWith("cell-plane"),
        )?.object.parent?.userData?.cell;

        // 4. 有効なマスの上であれば、UIストアのプレビュー座標を更新
        if (intersectedCell) {
          setPreviewPlacement({ x: intersectedCell.x, y: intersectedCell.y });
        }
      },
    },
    { drag: { filterTaps: true } }, // タップ操作とドラッグを区別する
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
