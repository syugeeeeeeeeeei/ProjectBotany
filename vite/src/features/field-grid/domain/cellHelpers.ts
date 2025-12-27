import {
  EmptyAreaCell,
  RecoveryPendingAreaCell,
  NativeAreaCell,
  AlienCoreCell,
  AlienInvasionAreaCell,
} from "@/shared/types/game-schema";

/**
 * マス生成ヘルパー (cellHelpers)
 * 
 * 【動機】
 * ゲーム盤面を構成する各マスの初期化処理を共通化し、型安全にオブジェクトを生成するためです。
 * 状態遷移のたびに手動でオブジェクトを組み立てる手間を省き、バグの混入を防ぎます。
 *
 * 【恩恵】
 * - `cellType` に応じた必須プロパティ（`alienInstanceId` 等）の付け忘れを防げます。
 * - 生成ロジックを一箇所に集約することで、マスのデータ構造を変更した際の影響範囲を最小限に抑えられます。
 * - コードの可読性が向上し、ドメインロジック（`nativeRestoration` 等）を簡潔に保てます。
 *
 * 【使用法】
 * ストアの初期化時や、浸食・再生などのロジック内で `createXxxCell(x, y, ...)` を呼び出します。
 */

/**
 * 空マス（EmptyAreaCell）を生成する
 * ゲーム開始時の初期化や、外来種が完全に除去された後の更地状態を作るために必要です
 */
export const createEmptyAreaCell = (x: number, y: number): EmptyAreaCell => ({
  x,
  y,
  cellType: "empty_area",
  ownerId: null,
});

/**
 * 再生待機マス（RecoveryPendingAreaCell）を生成する
 * 破壊された土地が「在来種」に戻る前の一時的な状態（インターバル）を管理するために必要です
 */
export const createRecoveryPendingAreaCell = (
  x: number,
  y: number,
  turn: number,
): RecoveryPendingAreaCell => ({
  x,
  y,
  cellType: "recovery_pending_area",
  ownerId: null,
  recoveryPendingTurn: turn,
});

/** 在来種マス（NativeAreaCell）を生成する */
export const createNativeAreaCell = (x: number, y: number): NativeAreaCell => ({
  x,
  y,
  cellType: "native_area",
  ownerId: "native",
});

/**
 * 外来種（コア）マス（AlienCoreCell）を生成する
 * 特定の外来種個体が存在する「中心点」を定義するために必要です
 */
export const createAlienCoreCell = (
  x: number,
  y: number,
  instanceId: string,
): AlienCoreCell => ({
  x,
  y,
  cellType: "alien_core",
  ownerId: "alien",
  alienInstanceId: instanceId,
});

/** 侵略マス（AlienInvasionAreaCell）を生成する */
export const createAlienInvasionAreaCell = (
  x: number,
  y: number,
  dominantId: string,
): AlienInvasionAreaCell => ({
  x,
  y,
  cellType: "alien_invasion_area",
  ownerId: "alien",
  dominantAlienInstanceId: dominantId,
});
