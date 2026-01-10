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

/**
 * マスの種類
 * ✨ 変更: alien-core (外来種の発生源) を追加
 */
export type CellType =
  | "native"      // 在来種
  | "alien"       // 外来種（拡散地）
  | "alien-core"  // 外来種（発生源/種/成体）
  | "bare"        // 裸地
  | "pioneer";    // 先駆植生

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

/**
 * 駆除タイプ
 * ✨ 変更: 3タイプに再定義
 * - simple: 簡易駆除（旧physical）。コスト安・反撃あり。
 * - complete: 完全駆除。コスト高・反撃なし。
 * - chain: 連鎖駆除。コスト特大・コア破壊時に全支配マスを除去。
 */
export type EradicationType = "simple" | "complete" | "chain";

/** 駆除後の土地状態 */
export type PostRemovalState = "bare" | "pioneer" | "empty";

/** 回復後の土地状態 */
export type PostRecoveryState = "pioneer" | "native";

/** 防御効果 */
export type ProtectionType = "none" | "1_round";