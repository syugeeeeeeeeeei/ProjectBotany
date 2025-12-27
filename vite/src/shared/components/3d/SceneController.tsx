import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

// --- 定数定義 ---

/** カメラの初期設定 */
const INITIAL_CAMERA_CONFIG = {
  POSITION: [0, 10, 0.1] as [number, number, number], // Y=10の高さから少しだけ手前に配置
  LOOK_AT: [0, 0, 0] as [number, number, number], // シーンの中心を注視
};

/**
 * 3D シーン制御コンポーネント (SceneController)
 * 
 * 【動機】
 * React Three Fiber の `Canvas` 内におけるカメラの初期位置の設定や、
 * デバッグ用コントロール（OrbitControls）の状態維持など、描画以外の
 * セッション管理を一箇所にまとめるためです。
 *
 * 【恩恵】
 * - アプリケーション起動時に常に同じアングル（真上からの見下ろし）で
 *   ゲームを開始できるよう保証します。
 * - 他のコンポーネントからカメラ操作が干渉された場合でも、
 *   副作用（useEffect）を通じて整合性を保つことができます。
 *
 * 【使用法】
 * `App.tsx` の `Canvas` コンポーネントの直下に配置します。
 */
const SceneController = () => {
  const { camera } = useThree();

  /**
   * コンポーネントのマウント時に一度だけカメラの初期位置と注視点を設定する。
   * ゲーム開始時に盤面全体が正しいアングルで見えるように強制するために必要です
   */
  useEffect(() => {
    camera.position.set(...INITIAL_CAMERA_CONFIG.POSITION);
    camera.lookAt(...INITIAL_CAMERA_CONFIG.LOOK_AT);
  }, [camera]);

  /**
   * カメラにアタッチされたOrbitControlsを常に有効化する。
   * (特定の状況で無効化された場合でも、再度有効に戻すため)
   * ユーザーが常に盤面を俯瞰・ズーム操作できるように権限を維持するために必要です
   */
  useEffect(() => {
    // camera.userData.controlsはDreiのOrbitControlsによって設定される
    const controls = (camera.userData as any).controls;
    if (controls) {
      controls.enabled = true;
    }
  }, [camera]);

  return null;
};

export default SceneController;
