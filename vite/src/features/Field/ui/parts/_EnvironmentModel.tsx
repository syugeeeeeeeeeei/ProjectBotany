import React from "react";
import { useGLTF } from "@react-three/drei";

const MODEL_NAME = "hand_painted_forest.glb";
/**
 * 背景用3Dモデルを表示するコンポーネント
 */
export const EnvironmentModel: React.FC = () => {
  // モデルファイルのパスを指定（publicフォルダ配下に配置すること）
  // 例: /models/background_scene.glb
  const { scene } = useGLTF(`/models/${MODEL_NAME}`);

  return (
    <primitive
      object={scene}
      position={[0, -10, 0]} // 盤面より少し下に配置
      scale={[10, 1, 10]} // シーンに合わせたサイズ調整
      rotation={[0, 0, 0]}
      receiveShadow
    />
  );
};

// プリロードしておくことで、描画時のカクつきを防止
useGLTF.preload(`/models/${MODEL_NAME}`);
