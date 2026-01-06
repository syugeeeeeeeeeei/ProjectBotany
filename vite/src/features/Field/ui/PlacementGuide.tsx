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
        // 配置不可なら「鮮やかな赤」で「高不透明度」
        const color = guide.isValid ? "#00FFFF" : "#FF3333";
        const opacity = guide.isValid ? 0.5 : 0.5; // 不透明度アップ (0.2 -> 0.6)
        const position = getPosition(guide.x, guide.y, 0.02);

        return (
          <group key={`base-guide-${idx}`} position={position}>
            {guide.isValid ? (
              // 配置可能: 薄いリング
              <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
                <ringGeometry
                  args={[0.4, 0.45, 4]}
                  rotateX={0}
                  rotateY={0}
                  rotateZ={Math.PI / 4}
                />
                <meshBasicMaterial
                  color={color}
                  opacity={opacity}
                  transparent
                  side={DoubleSide}
                />
              </mesh>
            ) : (
              // 配置不可: 明確なバツ印 (X)
              <group>
                {/* 右下がり斜線 */}
                <mesh
                  rotation={[-Math.PI / 2, 0, Math.PI / 4]}
                  position={[0, 0, 0]}
                  raycast={() => null}
                >
                  <planeGeometry args={[0.7, 0.08]} />
                  <meshBasicMaterial
                    color={color}
                    opacity={opacity}
                    transparent
                  />
                </mesh>
                {/* 左下がり斜線 (追加) */}
                <mesh
                  rotation={[-Math.PI / 2, 0, -Math.PI / 4]}
                  position={[0, 0, 0]}
                  raycast={() => null}
                >
                  <planeGeometry args={[0.7, 0.08]} />
                  <meshBasicMaterial
                    color={color}
                    opacity={opacity}
                    transparent
                  />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* 2. 効果範囲ハイライト (ホバー時のみ) */}
      {effectRange.map((p, idx) => {
        const position = getPosition(p.x, p.y, 0.03);
        const highlightOpacity = isHoverValid ? 0.7 : 0.3; // 少し強調

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
            isReady={isHoverValid}
          />
        </group>
      )}
    </group>
  );
};
