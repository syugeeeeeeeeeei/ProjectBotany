import React, { useMemo, useLayoutEffect, useRef } from "react";
import { DoubleSide, Object3D, InstancedMesh } from "three";
import { useUIStore } from "@/core/store/uiStore";
import { usePlacementGuide } from "../hooks/usePlacementGuide";
import { AlienToken } from "./parts/AlienToken";

// 計算用の一時オブジェクト（メモリ確保をコンポーネント外で行うことでGC負荷を低減）
const tempObject = new Object3D();

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

  // 1. ガイドデータの分類（配置可能 vs 配置不可）
  const { validGuides, invalidGuides } = useMemo(() => {
    const valid = [];
    const invalid = [];
    for (const guide of allCellGuides) {
      if (guide.isValid) valid.push(guide);
      else invalid.push(guide);
    }
    return { validGuides: valid, invalidGuides: invalid };
  }, [allCellGuides]);

  // InstancedMeshへの参照
  const validMeshRef = useRef<InstancedMesh>(null);
  const invalidMeshRef = useRef<InstancedMesh>(null);
  const highlightPlaneRef = useRef<InstancedMesh>(null);
  const highlightRingRef = useRef<InstancedMesh>(null);

  // 2. インスタンスの位置・回転情報を行列（Matrix）として更新
  useLayoutEffect(() => {
    // --- A. 配置可能ガイド（リング）の更新 ---
    if (validMeshRef.current) {
      // 数が0でも更新処理自体は走らせてクリアする、あるいは条件分岐でスキップ
      if (validGuides.length > 0) {
        const mesh = validMeshRef.current;
        validGuides.forEach((guide, i) => {
          const [x, y, z] = getPosition(guide.x, guide.y, 0.02);
          tempObject.position.set(x, y, z);
          tempObject.rotation.set(-Math.PI / 2, 0, 0); // 水平
          tempObject.scale.set(1, 1, 1);
          tempObject.updateMatrix();
          mesh.setMatrixAt(i, tempObject.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
      }
    }

    // --- B. 配置不可ガイド（バツ印）の更新 ---
    if (invalidMeshRef.current && invalidGuides.length > 0) {
      const mesh = invalidMeshRef.current;
      invalidGuides.forEach((guide, i) => {
        const [x, y, z] = getPosition(guide.x, guide.y, 0.02);

        // バツ印の1本目 (/)
        tempObject.position.set(x, y, z);
        tempObject.rotation.set(-Math.PI / 2, 0, Math.PI / 4);
        tempObject.scale.set(1, 1, 1);
        tempObject.updateMatrix();
        mesh.setMatrixAt(i * 2, tempObject.matrix);

        // バツ印の2本目 (\)
        tempObject.rotation.set(-Math.PI / 2, 0, -Math.PI / 4);
        tempObject.updateMatrix();
        mesh.setMatrixAt(i * 2 + 1, tempObject.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }

    // --- C. 効果範囲ハイライト（平面 + リング）の更新 ---
    // ハイライトは「平面(Plane)」と「リング(Ring)」の2層構造
    if (highlightPlaneRef.current && highlightRingRef.current) {
      if (effectRange.length > 0) {
        const planeMesh = highlightPlaneRef.current;
        const ringMesh = highlightRingRef.current;

        effectRange.forEach((p, i) => {
          // 基準位置
          const [x, y, z] = getPosition(p.x, p.y, 0.03);

          // 1. 平面 (Plane)
          tempObject.position.set(x, y, z);
          tempObject.rotation.set(-Math.PI / 2, 0, 0);
          tempObject.scale.set(1, 1, 1);
          tempObject.updateMatrix();
          planeMesh.setMatrixAt(i, tempObject.matrix);

          // 2. リング (Ring) - 少し上にずらす
          tempObject.position.set(x, y + 0.01, z); // Y + 0.01
          tempObject.updateMatrix();
          ringMesh.setMatrixAt(i, tempObject.matrix);
        });

        planeMesh.instanceMatrix.needsUpdate = true;
        ringMesh.instanceMatrix.needsUpdate = true;
      }
    }
  }, [validGuides, invalidGuides, effectRange, getPosition]);

  if (!isVisible) return null;

  // ハイライトの不透明度（全インスタンス共通）
  const highlightOpacity = isHoverValid ? 0.7 : 0.3;

  return (
    <group name="guide-layer">
      {/* パフォーマンス最適化: 全てのガイド表示を InstancedMesh に統一 
        これにより、Geometry生成はマウント時の1回のみとなり、描画負荷も最小化されます。
      */}

      {/* 1. 配置可能ガイド: 薄いリング */}
      {validGuides.length > 0 && (
        <instancedMesh
          ref={validMeshRef}
          args={[undefined, undefined, validGuides.length]}
          raycast={() => null}
        >
          <ringGeometry args={[0.4, 0.45, 4]} rotateZ={Math.PI / 4} />
          <meshBasicMaterial
            color="#00FFFF"
            opacity={0.5}
            transparent
            side={DoubleSide}
          />
        </instancedMesh>
      )}

      {/* 2. 配置不可ガイド: バツ印 (2倍のインスタンス数) */}
      {invalidGuides.length > 0 && (
        <instancedMesh
          ref={invalidMeshRef}
          args={[undefined, undefined, invalidGuides.length * 2]}
          raycast={() => null}
        >
          <planeGeometry args={[0.7, 0.08]} />
          <meshBasicMaterial color="#FF3333" opacity={0.5} transparent />
        </instancedMesh>
      )}

      {/* 3. 効果範囲ハイライト (ホバー時のみ) - InstancedMesh化 */}
      {effectRange.length > 0 && (
        <>
          {/* 背景の四角形 */}
          <instancedMesh
            ref={highlightPlaneRef}
            args={[undefined, undefined, effectRange.length]}
            raycast={() => null}
          >
            <planeGeometry args={[0.8, 0.8]} />
            <meshBasicMaterial
              color="#00FFFF"
              opacity={highlightOpacity}
              transparent
            />
          </instancedMesh>

          {/* 強調用のリング */}
          <instancedMesh
            ref={highlightRingRef}
            args={[undefined, undefined, effectRange.length]}
            raycast={() => null}
          >
            <ringGeometry args={[0.38, 0.42, 32]} />
            <meshBasicMaterial color="#00FFFF" opacity={0.8} transparent />
          </instancedMesh>
        </>
      )}

      {/* 4. プレビュートークン (指に追従) */}
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
