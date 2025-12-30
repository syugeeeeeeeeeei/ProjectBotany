/**
 * プリミティブ型定義
 * アプリケーション全体で共通して使われる最小単位の型
 */

/** 2D座標 */
export interface Point {
  x: number;
  y: number;
}

/** 3Dベクトル (Three.jsとの互換用) */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/** プレイヤー種別 */
export type PlayerType = "native" | "alien";

/** ゲームの進行フェーズ */
export type GamePhase =
  | "environment_phase"
  | "summon_phase"
  | "activation_phase";

/** カードの効果範囲形状 */
export type ShapeType = "single" | "cross" | "straight" | "range";

/** 方向 */
export type DirectionType =
  | "up"
  | "down"
  | "left"
  | "right"
  | "vertical"
  | "horizon";

/** 成長条件定義 */
export interface GrowthCondition {
  type: "turns_since_last_action";
  value: number;
}

/** 成長効果定義 */
export interface GrowthEffect {
  newInvasionPower?: number;
  newInvasionShape?: ShapeType;
}