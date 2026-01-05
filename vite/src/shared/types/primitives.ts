/**
 * src/shared/types/primitives.ts
 * ゲーム全体で使用される基本的な型定義（プリミティブな列挙型など）
 */

// --- 基本データ構造 (復活) ---

/** 2D座標 */
export interface Point {
  x: number;
  y: number;
}

/** 3Dベクトル (Three.js互換用・既存コンポーネントで使用) */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// --- ID・区分定義 ---

/** プレイヤーID */
export type PlayerId = "native" | "alien";

/** * 既存コンポーネント互換用エイリアス 
 * (修正されていないファイルが PlayerType を参照している場合のため)
 */
export type PlayerType = PlayerId;

/** ゲームの進行フェーズ */
export type GamePhase =
  | "start"       // ラウンド開始（AP回復、植生遷移）
  | "alien_turn"  // 外来種アクション
  | "native_turn" // 在来種アクション
  | "end";        // ラウンド終了（拡散、成長）

/** マスの種類 */
export type CellType =
  | "native"   // 在来種（緑）
  | "alien"    // 外来種（赤）
  | "bare"     // 裸地（灰）
  | "pioneer"; // 先駆植生（薄緑）

/** 成長段階 */
export type GrowthStatus =
  | "seed"   // 種（無害、休眠期間）
  | "plant"; // 成体（拡散・反撃あり）

/** グリッド形状（効果範囲・拡散形状など） */
export type GridShape =
  | "point"    // 1マス
  | "vertical" // 縦一列
  | "horizon"  // 横一列
  | "cross"    // 十字
  | "x_cross"  // 斜め十字
  | "range";   // 周囲（正方形）

/** 外来種の反撃能力 */
export type CounterAbility =
  | "none"         // なし
  | "spread_seed"; // 種子散布（物理駆除時に周囲へ種生成）

/** 駆除タイプ */
export type EradicationType =
  | "physical" // 物理駆除（コスト安、反撃リスクあり）
  | "complete"; // 完全駆除（コスト高、反撃無効）

/** 駆除後の土地状態 */
export type PostRemovalState =
  | "bare"    // 裸地に戻る
  | "pioneer" // 先駆植生になる（被覆効果）
  | "empty";  // 完全消滅（連鎖駆除などで使用）

/** 回復後の土地状態 */
export type PostRecoveryState =
  | "pioneer" // 先駆植生
  | "native"; // 在来種

/** 防御効果（回復時など） */
export type ProtectionType =
  | "none"
  | "1_round"; // 次のラウンド終了時まで侵入・拡散無効