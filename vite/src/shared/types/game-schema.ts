// vite/src/shared/types/game-schema.ts

/**
 * ゲーム全体のデータ構造定義 (game-schema)
 */
export * from "./primitives";
import {
  PlayerType,
  ShapeType,
  DirectionType,
  GamePhase,
  GrowthCondition,
  GrowthEffect,
} from "./primitives";
import { ActionLog } from "./actions";

// --- マス定義 (要件定義準拠) ---
export type CellType =
  | "native_area" // 在来種マス
  | "alien_area" // 外来種マス (CoreとInvasionを統合)
  | "bare_ground_area" // 裸地マス (旧 empty_area)
  | "pioneer_vegetation_area"; // 先駆植生マス (旧 recovery_pending_area)

// --- カード定義 ---
interface CardDefinitionBase {
  id: string;
  name: string;
  description: string;
  cost: number;
  deckCount: number;
  imagePath: string;
  usageLimit?: number | null;
  cooldownRounds?: number | null; // Turn -> Round
}

type TargetingDefinition =
  | {
    shape: ShapeType;
    power: number;
    direction?: DirectionType;
    target?: "alien_area"; // 統合されたCellTypeに対応
  }
  | {
    target: "species";
  };

export interface AlienCard extends CardDefinitionBase {
  cardType: "alien";
  targeting: {
    shape: ShapeType;
    power: number;
    direction?: DirectionType;
  };
  canGrow?: boolean;
  growthConditions?: GrowthCondition[];
  growthEffects?: GrowthEffect[];
}

export interface EradicationCard extends CardDefinitionBase {
  cardType: "eradication";
  targeting: TargetingDefinition;
  postRemovalState: "bare_ground_area" | "pioneer_vegetation_area";
}

export interface RecoveryCard extends CardDefinitionBase {
  cardType: "recovery";
  targeting: TargetingDefinition;
  postRecoveryState: "native_area" | "pioneer_vegetation_area";
}

export type CardDefinition = AlienCard | EradicationCard | RecoveryCard;

// --- インスタンスと状態 ---
export interface CardInstance {
  instanceId: string;
  cardDefinitionId: string;
}

export interface PlayerState {
  playerId: PlayerType;
  playerName: string;
  facingFactor: 1 | -1;
  initialEnvironment: number;
  currentEnvironment: number;
  maxEnvironment: number;
  cardLibrary: CardInstance[];
  cooldownActiveCards: { cardId: string; roundsRemaining: number }[]; // Turn -> Round
  limitedCardsUsedCount: { [cardId: string]: number };
}

export interface ActiveAlienInstance {
  instanceId: string;
  spawnedRound: number; // Turn -> Round
  cardDefinitionId: string;

  // 座標 (トークンの位置)
  currentX: number;
  currentY: number;

  // 成長パラメータ (要件定義追加分)
  currentInvasionPower: number;
  currentInvasionShape: ShapeType;
  currentGrowthStage: number;
  roundsSinceSpawn: number;
}

// --- フィールド ---
interface CellStateBase {
  x: number;
  y: number;
}

export interface NativeAreaCell extends CellStateBase {
  cellType: "native_area";
  ownerId: "native";
}

export interface BareGroundAreaCell extends CellStateBase {
  cellType: "bare_ground_area"; // 旧 empty_area
  ownerId: null;
}

export interface PioneerVegetationAreaCell extends CellStateBase {
  cellType: "pioneer_vegetation_area"; // 旧 recovery_pending_area
  ownerId: null;
  createdRound: number; // recoveryPendingTurn -> createdRound
}

export interface AlienAreaCell extends CellStateBase {
  cellType: "alien_area"; // 旧 alien_core & alien_invasion_area
  ownerId: "alien";
  dominantAlienInstanceId: string; // このマスを支配している外来種ID
}

export type CellState =
  | NativeAreaCell
  | BareGroundAreaCell
  | PioneerVegetationAreaCell
  | AlienAreaCell;

export interface FieldState {
  width: number;
  height: number;
  cells: CellState[][];
}

export interface GameState {
  currentRound: number; // Turn -> Round
  maximumRounds: number;
  activePlayerId: PlayerType;
  gameField: FieldState;
  playerStates: { [key in PlayerType]: PlayerState };
  currentPhase: GamePhase;
  isGameOver: boolean;
  winningPlayerId: PlayerType | null;
  activeAlienInstances: { [instanceId: string]: ActiveAlienInstance };
  nativeScore: number;
  alienScore: number;
  history: ActionLog[];
}