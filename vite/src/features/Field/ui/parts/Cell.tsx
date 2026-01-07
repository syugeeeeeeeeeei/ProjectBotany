import React, { useRef, useState } from "react";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { RoundedBox, Edges, useCursor } from "@react-three/drei"; // ✨ 追加
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
    handlers.handlePointerOut();
  };

  return (
    <group ref={meshRef} position={[posX, 0, posZ]}>
      {/* ✨ RoundedBox: 角の丸い厚みのあるボックス */}
      <RoundedBox
        args={[DESIGN.BOARD.CELL_SIZE, 0.1, DESIGN.BOARD.CELL_SIZE]} // 幅, 厚み, 奥行き
        radius={0.05} // 角の丸み
        smoothness={4} // 丸みの滑らかさ
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerUp={handlers.handleClick}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          color={styles.cellColor}
          emissive={styles.emissiveColor}
          emissiveIntensity={styles.emissiveIntensity + (hovered ? 0.5 : 0)} // ホバー時に発光強化
          roughness={0.4}
          metalness={0.1}
        />

        {/* ✨ エッジ: 輪郭線をうっすら表示してタイルの境界を明確に */}
        <Edges
          threshold={15} // 角の角度閾値
          color={hovered ? "white" : "black"}
          scale={1.0}
        />
      </RoundedBox>
    </group>
  );
};
