import React from "react";
import { DoubleSide } from "three";
import { useUIStore } from "@/core/store/uiStore";
import { usePlacementGuide } from "../hooks/usePlacementGuide";
import { AlienToken } from "./parts/AlienToken";

export const PlacementGuide: React.FC = () => {
  const {
    allCellGuides,
    effectRange,
    previewPosition,
    selectedCard,
    getPosition,
    isVisible,
  } = usePlacementGuide();

  // 配置可能状態(1秒経過)かどうかを取得
  const isHoverValid = useUIStore((s) => s.isHoverValid);

  if (!isVisible) return null;

  return (
    <group name="guide-layer">
      {/* 1. 全マスガイド (置ける/置けないの一覧) */}
      {allCellGuides.map((guide, idx) => {
        const color = guide.isValid ? "#00FFFF" : "#FF0000"; // 水色 or 赤
        const position = getPosition(guide.x, guide.y, 0.02);

        return (
          <group key={`base-guide-${idx}`} position={position}>
            {guide.isValid ? (
              <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
                <ringGeometry
                  args={[0.4, 0.45, 4]}
                  // rotation={[0, 0, Math.PI / 4]}
                  rotateX={0}
                  rotateY={0}
                  rotateZ={Math.PI / 4}
                />
                <meshBasicMaterial
                  color={color}
                  opacity={0.3}
                  transparent
                  side={DoubleSide}
                />
              </mesh>
            ) : (
              <group>
                <mesh
                  rotation={[-Math.PI / 2, 0, Math.PI / 4]}
                  position={[0, 0, 0]}
                  raycast={() => null}
                >
                  <planeGeometry args={[0.6, 0.05]} />
                  <meshBasicMaterial color={color} opacity={0.2} transparent />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* 2. 効果範囲ハイライト (ホバー時のみ) */}
      {effectRange.map((p, idx) => {
        const position = getPosition(p.x, p.y, 0.03);
        // 配置可能(isHoverValid)になったらハイライトも少し強調する
        const highlightOpacity = isHoverValid ? 0.4 : 0.2;

        return (
          <group key={`effect-range-${idx}`} position={position}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
              <planeGeometry args={[0.8, 0.8]} />
              <meshBasicMaterial
                color="#00FFFF"
                opacity={highlightOpacity}
                transparent
              />
            </mesh>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.01, 0]}
              raycast={() => null}
            >
              <ringGeometry args={[0.38, 0.42, 32]} />
              <meshBasicMaterial color="#00FFFF" opacity={0.8} transparent />
            </mesh>
          </group>
        );
      })}

      {/* 3. プレビュートークン (指に追従) */}
      {previewPosition && selectedCard?.cardType === "alien" && (
        <group name="preview-token">
          <AlienToken
            x={previewPosition.x}
            y={previewPosition.y}
            status="seed"
            isPreview={true}
            isReady={isHoverValid} // ✨ 状態を渡す
          />
        </group>
      )}
    </group>
  );
};
