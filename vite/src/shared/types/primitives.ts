// vite/src/shared/types/primitives.ts

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

/** ゲームの進行フェーズ (要件定義準拠) */
export type GamePhase =
  | "round_start" // ラウンド開始（エンバイロメント回復・自動回復）
  | "alien_turn" // 外来種の手番
  | "native_turn" // 在来種の手番
  | "round_end"; // ラウンド終了（成長・拡散・勝敗判定）

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
  type: "rounds_since_spawn";
  value: number;
}

/** 成長効果定義 */
export interface GrowthEffect {
  newInvasionPower?: number;
  newInvasionShape?: ShapeType;
}