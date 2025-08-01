// PlayerId, GrowthEffect, GrowthCondition, CardDefinition は変更なし

export type PlayerId = 'native_side' | 'alien_side';

export interface GrowthEffect {
  type: 'increase_invasion_power';
  value: number;
}

export interface GrowthCondition {
  type: 'turns_since_last_action';
  value: number;
}

export interface CardDefinition {
  id: string;
  name: string;
  description: string;
  cost: number;
  cardType: 'alien' | 'eradication' | 'recovery';
  imagePath: string;
  baseInvasionPower?: number;
  baseInvasionShape?: 'single' | 'cross' | 'straight' | 'range';
  canGrow?: boolean;
  growthConditions?: GrowthCondition[];
  growthEffects?: GrowthEffect[];
  targetType?: 'cell' | 'alien_plant';
  removalMethod?: 'direct_n_cells' | 'range_selection' | 'target_alien_and_its_dominant_cells';
  postRemovalState?: 'empty_area' | 'recovery_pending_area';
  usageLimit?: number | null;
  cooldownTurns?: number | null;
}

/**
 * プレイヤーの状態
 */
export interface PlayerState {
  playerId: PlayerId;
  playerName: string;
  currentEnvironment: number;
  maxEnvironment: number;
  playableCardIds: string[];
  cooldownActiveCards: { cardId: string; turnsRemaining: number }[];
  limitedCardsUsedCount: { [cardId: string]: number };
}

export interface ActiveAlienInstance {
  instanceId: string;
  spawnedTurn: number;
  cardDefinitionId: string;
  ownerId: PlayerId;
  currentX: number;
  currentY: number;
  currentInvasionPower: number;
  currentInvasionShape: 'single' | 'cross' | 'straight' | 'range';
  currentGrowthStage: number;
  turnsSinceLastAction: number;
}

/**
 * マスの状態
 */
export interface CellState {
  x: number;
  y: number;
  // ✨ 'recovery_pending_area' を追加
  cellType: 'native_area' | 'alien_core' | 'alien_invasion_area' | 'empty_area' | 'recovery_pending_area' | 'rock' | 'pond';
  ownerId: PlayerId | null;
  dominantAlienInstanceId: string | null;
}

export interface FieldState {
  width: number;
  height: number;
  cells: CellState[][];
}
export interface GameState {
  currentTurn: number;
  maximumTurns: number;
  activePlayerId: PlayerId;
  gameField: FieldState;
  playerStates: {
    [key in PlayerId]: PlayerState;
  };
  currentPhase: 'preparation' | 'activation' | 'end';
  isGameOver: boolean;
  winningPlayerId: PlayerId | null;
  activeAlienInstances: { [instanceId: string]: ActiveAlienInstance };
  cardMasterData: { [id: string]: CardDefinition };
}

export interface GameActions {
  progressTurn: () => void;
  playCard: (cardDefinitionId: string, x: number, y: number) => void;
  moveAlien: (instanceId: string, targetX: number, targetY: number) => void;
}

export type GameStore = GameState & GameActions;