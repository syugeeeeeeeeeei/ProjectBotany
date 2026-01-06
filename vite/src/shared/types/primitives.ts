// vite/src/shared/types/primitives.ts

/** 2D座標 */
export interface Point {
  x: number;
  y: number;
}

/** 3Dベクトル */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// --- ID・区分定義 ---

/** プレイヤーID */
export type PlayerId = "native" | "alien";

/** 互換用エイリアス */
export type PlayerType = PlayerId;

/** ゲームの進行フェーズ */
export type GamePhase =
  | "start"
  | "alien_turn"
  | "native_turn"
  | "end";

/** マスの種類 */
export type CellType =
  | "native"
  | "alien"
  | "bare"
  | "pioneer";

/** 成長段階 */
export type GrowthStatus = "seed" | "plant";

/** グリッド形状 */
export type GridShape =
  | "point"
  | "vertical"
  | "horizon"
  | "cross"
  | "x_cross"
  | "range"
  | "straight"; // 追加: EffectSystemで使用

/** EffectSystem互換用エイリアス */
export type ShapeType = GridShape;

/** 方向定義 (EffectSystem用) */
export type DirectionType = "up" | "down" | "left" | "right" | "vertical" | "horizon";

/** 外来種の反撃能力 */
export type CounterAbility = "none" | "spread_seed";

/** 駆除タイプ */
export type EradicationType = "physical" | "complete";

/** 駆除後の土地状態 */
export type PostRemovalState = "bare" | "pioneer" | "empty";

/** 回復後の土地状態 */
export type PostRecoveryState = "pioneer" | "native";

/** 防御効果 */
export type ProtectionType = "none" | "1_round";