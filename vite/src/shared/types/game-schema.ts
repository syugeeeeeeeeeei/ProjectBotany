// vite/src/shared/types/game-schema.ts

import {
  PlayerId,
  GamePhase,
  CellType,
  GrowthStatus,
} from "./primitives";
import { ActionLog } from "./actions";

// --- インスタンスと状態 ---

/** 手札にあるカードの実体 */
export interface CardInstance {
  instanceId: string;
  cardDefinitionId: string;
}

/** プレイヤーの状態 */
export interface PlayerState {
  playerId: PlayerId;
  playerName: string;
  facingFactor: 1 | -1;

  // エンバイロメント (AP)
  initialEnvironment: number;
  currentEnvironment: number;
  maxEnvironment: number;

  // カード管理
  cardLibrary: CardInstance[];
  cooldownActiveCards: { cardId: string; roundsRemaining: number }[];
  limitedCardsUsedCount: { [cardId: string]: number };
}

/** * 外来種ユニット（インスタンス）
 * 種(Seed)または成体(Core)としてフィールドに存在するオブジェクト
 */
export interface AlienInstance {
  instanceId: string;
  cardDefinitionId: string;

  // 導入情報
  spawnedRound: number; // 成長判定用

  // 状態
  status: GrowthStatus; // "seed" | "plant"

  // 座標
  currentX: number;
  currentY: number;
}

// --- フィールド ---

/** * 個々のマスの状態 
 * 個別のインターフェース(NativeAreaCell等)は廃止し、typeプロパティで判別する
 */
export interface CellState {
  x: number;
  y: number;

  /** マスの種類 ("native" | "alien" | "bare" | "pioneer") */
  type: CellType;

  /** 支配プレイヤー */
  ownerId: PlayerId | null;

  /** このマスに存在するユニットのID (Seed/Core) */
  alienUnitId?: string;
}

export interface FieldState {
  width: number;
  height: number;
  cells: CellState[][];
}

// --- ゲーム全体の状態 (Store) ---

export interface GameState {
  currentRound: number;
  maximumRounds: number;
  activePlayerId: PlayerId;
  currentPhase: GamePhase;

  // 勝敗フラグ
  isGameOver: boolean;
  winningPlayerId: PlayerId | null;

  // スコア
  nativeScore: number;
  alienScore: number;

  // メインデータ
  gameField: FieldState;
  playerStates: { [key in PlayerId]: PlayerState };

  /** * 外来種インスタンス管理
   * キーは instanceId
   */
  alienInstances: Record<string, AlienInstance>;

  // 履歴
  history: ActionLog[];
}