/** プレイヤーの種類を定義する */
export type PlayerType = "native" | "alien";

/** マスの状態（種類）を定義する */
export type CellType =
	| "native_area"
	| "alien_core"
	| "alien_invasion_area"
	| "empty_area"
	| "recovery_pending_area";

/** カードの効果範囲の形状を定義する */
export type ShapeType = "single" | "cross" | "straight" | "range";

/** カード効果の方向を定義する */
export type DirectionType =
	| "up"
	| "down"
	| "left"
	| "right"
	| "vertical"
	| "horizon";

// --- 成長関連の型定義 ---

/** 外来種が成長した際の具体的な効果を定義する */
export interface GrowthEffect {
	newInvasionPower?: number;
	newInvasionShape?: ShapeType;
}

/** 外来種が成長するための条件を定義する */
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

// --- インスタンスと状態の型定義 ---

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
	currentX: number;
	currentY: number;
	currentInvasionPower: number;
	currentInvasionShape: ShapeType;
	currentGrowthStage: number;
	turnsSinceLastAction: number;
}

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

export interface GameState {
	currentTurn: number;
	maximumTurns: number;
	activePlayerId: PlayerType;
	gameField: FieldState;
	playerStates: {
		[key in PlayerType]: PlayerState;
	};
	currentPhase: "environment_phase" | "summon_phase" | "activation_phase";
	isGameOver: boolean;
	winningPlayerId: PlayerType | null;
	activeAlienInstances: { [instanceId: string]: ActiveAlienInstance };
	nativeScore: number;
	alienScore: number;
}