/**
 * 🌿 HUD Feature (ヘッドアップディスプレイ機能)
 * 
 * 【動機】
 * ゲームの状態やプレイヤーへのメッセージを、3D シーンの手前に
 * 2D プレーンとして表示し、常に重要な情報を確認できるようにするためです。
 *
 * 【恩恵】
 * - 3D 空間内のカメラ角度に左右されず、常に読みやすい形でテキストや数値を提示できます。
 * - ターン開始、ゲームオーバー、通知などの重要なイベントを画面全体に強調して表示できます。
 *
 * 【使用法】
 * `App.tsx` 内で、3D Canvas とは別のレイヤーとして `GameInfo` や `UIOverlay` を配置します。
 */
export { default as GameInfo } from "./ui/GameInfo";
export { default as UIOverlay } from "./ui/UIOverlay";
