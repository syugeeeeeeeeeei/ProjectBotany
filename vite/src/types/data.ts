// ✨ 新しくPlayerId型を定義・エクスポート
export type PlayerId = 'native_side' | 'alien_side';

// ✨ GrowthEffectとGrowthConditionの型を追加
export interface GrowthEffect {
  type: 'increase_invasion_power' | 'change_invasion_shape';
  value?: number;
  newShape?: 'single' | 'cross' | 'straight' | 'range';
}

export interface GrowthCondition {
  type: 'turns_since_last_action';
  value: number;
}

/**
 * 🃏 カードの定義
 */
export interface CardDefinition {
  id: string;
  name: string;
  description: string;
  cost: number;
  cardType: 'alien' | 'eradication' | 'recovery';
  imagePath: string;

  // 外来種カード固有
  baseInvasionPower?: number;
  baseInvasionShape?: 'single' | 'cross' | 'straight' | 'range';
  canGrow?: boolean;
  growthConditions?: GrowthCondition[];
  growthEffects?: GrowthEffect[];

  // 駆除カード固有
  targetType?: 'cell' | 'alien_plant';
  removalMethod?: 'direct_n_cells' | 'range_selection' | 'target_alien_and_its_dominant_cells';
  postRemovalState?: 'empty_area' | 'recovery_pending_area';

  // 回復カード固有
  recoveryMethod?: 'direct_n_cells' | 'range_selection';

  // 回復・駆除カード固有
  usageLimit?: number | null;
  cooldownTurns?: number | null;
}

// ... 以降の型定義は変更なし ...
export interface PlayerCardInstance {
  instanceId: string;
  cardDefinitionId: string;
}
export interface PlayerState {
  playerId: PlayerId;
  playerName: string;
  currentEnvironment: number;
  maxEnvironment: number;
  cardLibrary: PlayerCardInstance[];
  cooldownActiveCards: { cardId: string, turnsRemaining: number }[];
  limitedCardsUsedCount: { [cardId: string]: number };
}
export interface ActiveAlienInstance {
  instanceId: string;
  spawnedTurn: number;
  cardDefinitionId: string;
  currentX: number;
  currentY: number;
  currentInvasionPower: number;
  currentInvasionShape: 'single' | 'cross' | 'straight' | 'range';
  currentGrowthStage: number;
  turnsSinceLastAction: number;
}
export interface CellState {
  x: number;
  y: number;
  cellType: 'native_area' | 'alien_core' | 'alien_invasion_area' | 'empty_area' | 'recovery_pending_area';
  ownerId: PlayerId | null;
  alienInstanceId: string | null;
  dominantAlienInstanceId: string | null;
  recoveryPendingTurn: number | null;
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
    native_side: PlayerState;
    alien_side: PlayerState;
  };
  currentPhase: 'environment_phase' | 'summon_phase' | 'activation_phase';
  isGameOver: boolean;
  winningPlayerId: PlayerId | null;
  activeAlienInstances: { [instanceId: string]: ActiveAlienInstance };
}