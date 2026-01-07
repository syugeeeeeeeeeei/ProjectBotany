import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

/**
 * 背景画像を最高画質で管理するコンポーネント
 */
const SceneBackground = ({ image }: { image: string }) => {
  const texture = useTexture(image);
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    if (texture) {
      // 1. 色空間の設定 (sRGBで正確な色味を出す)
      texture.colorSpace = THREE.SRGBColorSpace;

      // 2. 異方性フィルタリングを最大値に設定
      // デバイスがサポートする最大値（通常16）を適用し、斜め方向のボケを最小限にする
      const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
      texture.anisotropy = maxAnisotropy;

      // 3. フィルタリング設定
      // 拡大・縮小時の補完を線形補完に設定
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;

      // 4. 更新フラグを立てる
      texture.needsUpdate = true;
    }
  }, [texture, gl]);

  return <primitive attach="background" object={texture} />;
};

export default SceneBackground;
