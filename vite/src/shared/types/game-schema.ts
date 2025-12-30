export * from "./primitives";
import { PlayerType, ShapeType, DirectionType, GamePhase } from "./primitives";
import { ActionLog } from "./actions"; // 追加

/**
 * ゲーム全体のデータ構造定義 (game-schema)
 * CoreとFeatureが共有する Source of Truth
 */

// --- マス・成長定義 ---

/** マスの状態（種類） */
export type CellType =
  | "native_area"
  | "alien_core"
  | "alien_invasion_area"
  | "empty_area"
  | "recovery_pending_area";

export interface GrowthEffect {
  newInvasionPower?: number;
  newInvasionShape?: ShapeType;
}

export interface GrowthCondition {
  type: "turns_since_last_action";
  value: number;
}

// --- カード定義 ---

interface CardDefinitionBase {
  id: string;
  name: string;
  description: string;
  cost: number;
  deckCount: number;
  imagePath: string;
  usageLimit?: number | null;
  cooldownTurns?: number | null;
}

type TargetingDefinition =
  | {
      shape: "straight";
      power: number;
      direction: DirectionType;
      target?: "alien_invasion_area" | "alien_core";
    }
  | {
      shape: "cross" | "range" | "single";
      power: number;
      target?: "alien_invasion_area" | "alien_core";
    }
  | {
      target: "species";
    };

export interface AlienCard extends CardDefinitionBase {
  cardType: "alien";
  targeting:
    | {
        shape: "straight";
        power: number;
        direction: DirectionType;
      }
    | {
        shape: "cross" | "range" | "single";
        power: number;
      };
  canGrow?: boolean;
  growthConditions?: GrowthCondition[];
  growthEffects?: GrowthEffect[];
}

export interface EradicationCard extends CardDefinitionBase {
  cardType: "eradication";
  targeting: TargetingDefinition;
  postRemovalState: "empty_area" | "recovery_pending_area";
}

export interface RecoveryCard extends CardDefinitionBase {
  cardType: "recovery";
  targeting: TargetingDefinition;
  postRecoveryState: "native_area" | "recovery_pending_area";
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
  cooldownActiveCards: { cardId: string; turnsRemaining: number }[];
  limitedCardsUsedCount: { [cardId: string]: number };
}

export interface ActiveAlienInstance {
  instanceId: string;
  spawnedTurn: number;
  cardDefinitionId: string;
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
export interface EmptyAreaCell extends CellStateBase {
  cellType: "empty_area";
  ownerId: null;
}
export interface RecoveryPendingAreaCell extends CellStateBase {
  cellType: "recovery_pending_area";
  ownerId: null;
  recoveryPendingTurn: number;
}
export interface AlienCoreCell extends CellStateBase {
  cellType: "alien_core";
  ownerId: "alien";
  alienInstanceId: string;
}
export interface AlienInvasionAreaCell extends CellStateBase {
  cellType: "alien_invasion_area";
  ownerId: "alien";
  dominantAlienInstanceId: string;
}

export type CellState =
  | NativeAreaCell
  | EmptyAreaCell
  | RecoveryPendingAreaCell
  | AlienCoreCell
  | AlienInvasionAreaCell;

export interface FieldState {
  width: number;
  height: number;
  cells: CellState[][];
}

// --- ゲーム全体 ---

export interface GameState {
  currentTurn: number;
  maximumTurns: number;
  activePlayerId: PlayerType;
  gameField: FieldState;
  playerStates: {
    [key in PlayerType]: PlayerState;
  };
  currentPhase: GamePhase;
  isGameOver: boolean;
  winningPlayerId: PlayerType | null;
  activeAlienInstances: { [instanceId: string]: ActiveAlienInstance };
  nativeScore: number;
  alienScore: number;
  // 修正: ジェネリクスのデフォルト(unknown)を利用し、Core側では中身を関知しない
  history: ActionLog[];
}
