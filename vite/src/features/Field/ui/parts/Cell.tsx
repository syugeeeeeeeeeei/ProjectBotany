import React, { useRef, useState } from "react";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { RoundedBox, useCursor } from "@react-three/drei"; // ✨ Edges を削除
import * as THREE from "three";
import { CellState } from "@/shared/types/game-schema";
import { DESIGN } from "@/shared/constants/design-tokens";
import { useCellLogic } from "../../hooks/useCellLogic";

interface CellProps {
  cell: CellState;
}

export const Cell: React.FC<CellProps> = ({ cell }) => {
  const { styles, handlers } = useCellLogic(cell);
  const meshRef = useRef<THREE.Group>(null);

  // ホバー状態をローカルでも管理してアニメーションに使用
  const [hovered, setHover] = useState(false);

  const posX = (cell.x - (7 - 1) / 2) * DESIGN.BOARD.CELL_GAP;
  const posZ = (cell.y - (10 - 1) / 2) * DESIGN.BOARD.CELL_GAP;

  useCursor(hovered); // ホバー時にカーソルを変更

  // アニメーション: ホバー時に少し浮き上がり、色を変化させる
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Y軸のターゲット位置 (ホバー時は 0.1 上げる)
    const targetY = hovered ? 0.1 : 0;

    // ✨ 最適化: 現在位置とターゲットの差が極小なら計算をスキップ (Early Return)
    if (Math.abs(meshRef.current.position.y - targetY) < 0.001) {
      if (meshRef.current.position.y !== targetY) {
        meshRef.current.position.y = targetY; // 位置を確定
      }
      return;
    }

    // 線形補間(Lerp)で滑らかに移動
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      targetY,
      delta * 10,
    );
  });

  const handlePointerOver = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setHover(true);
    handlers.handlePointerOver(e);
  };

  const handlePointerOut = () => {
    setHover(false);
    // ✨ 修正: マスの隙間に移動した際のちらつきを防ぐため、
    // ここで Global State (hoveredCell) をクリアしないように変更。
    // 解除は GameBoard3D の背景ホバーで行う。
    // handlers.handlePointerOut();
  };

  return (
    <group ref={meshRef} position={[posX, 0, posZ]}>
      {/* ✨ RoundedBox: ポリゴン数を削減 */}
      <RoundedBox
        args={[DESIGN.BOARD.CELL_SIZE, 0.1, DESIGN.BOARD.CELL_SIZE]}
        radius={0.05}
        smoothness={1} // ✨ 4 -> 1 に削減 (Triangles激減)
        creaseAngle={0.4} // ✨ ポリゴンが少なくても滑らかに見えるよう調整
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerUp={handlers.handleClick}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          color={styles.cellColor}
          emissive={styles.emissiveColor}
          emissiveIntensity={styles.emissiveIntensity + (hovered ? 0.5 : 0)}
          roughness={0.4}
          metalness={0.1}
        />
      </RoundedBox>
    </group>
  );
};
