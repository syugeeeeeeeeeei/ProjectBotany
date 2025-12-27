import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';

// --- 定数定義 ---

const CAMERA_CONFIG = {
	POSITION: [0, 10, 0] as [number, number, number],
	LOOK_AT: [0, 0, 0] as [number, number, number],
	FOV: 70,
};

/**
 * 3Dシーンのカメラと操作権限を中央管理するコンポーネント。
 * R3Fの標準カメラを自作カメラで上書きし、OrbitControlsとの整合性を保証します。
 */
const SceneController = () => {
	// 【クリティカル】カメラとコントロールのインスタンスを直接保持
	const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
	const controlsRef = useRef<any>(null!);

	/**
	 * 【工夫点】useLayoutEffect を使用
	 * 画面がブラウザに描画される前にカメラの初期位置を確定させ、
	 * 初期フレームでの位置ズレやチラつきを完全に防止します。
	 */
	useLayoutEffect(() => {
		// 1. カメラ本体の位置を設定
		if (cameraRef.current) {
			cameraRef.current.position.set(...CAMERA_CONFIG.POSITION);
		}

		// 2. コントロールの内部状態をカメラと同期
		if (controlsRef.current) {
			// 【重要】lookAt ではなく target をセットする
			controlsRef.current.target.set(...CAMERA_CONFIG.LOOK_AT);

			// 【最重要】手動で座標を変えた後は必ず update() を呼び出し、
			// OrbitControls 内部の球座標（角度・距離）を再計算させる
			controlsRef.current.update();
		}
	}, []);

	return (
		<>
			{/* * 1. 自前のカメラ定義
              * makeDefault: Canvas が自動生成するカメラをこのインスタンスで差し替える。
              */}
			<PerspectiveCamera
				ref={cameraRef}
				makeDefault
				fov={CAMERA_CONFIG.FOV}
				position={CAMERA_CONFIG.POSITION}
			/>

			{/* * 2. 操作コントローラー
              * camera: 操作対象を cameraRef.current に固定することで参照のブレを無くす。
              * target: ここでも target を指定することで、初期化時の向きを保証。
              */}
			<OrbitControls
				ref={controlsRef}
				makeDefault
				camera={cameraRef.current}
				target={CAMERA_CONFIG.LOOK_AT}
				// 【運用要件】ユーザーによるカメラ移動を完全に封鎖
				enableZoom={false}
				enableRotate={false}
				enablePan={false}
				// 慣性（Damping）をオフにすることで、意図しない微細な動きを排除
				enableDamping={false}
			/>
		</>
	);
};

export default SceneController;