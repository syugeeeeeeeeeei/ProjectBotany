import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

const SceneController = () => {
	const { camera } = useThree();

	// コンポーネントのマウント時に一度だけカメラ位置を設定
	useEffect(() => {
		camera.position.set(0, 10, 0.1); // 少しだけZ軸をずらすと回転の基準が分かりやすい
		camera.lookAt(0, 0, 0); // 常にボードの中心を見る
	}, [camera]);

	// OrbitControlsを常に有効にする
	useEffect(() => {
		if ((camera.userData as any).controls) {
			(camera.userData as any).controls.enabled = true;
		}
	}, [camera]);


	return null; // このコンポーネントは何も描画しない
};

export default SceneController;