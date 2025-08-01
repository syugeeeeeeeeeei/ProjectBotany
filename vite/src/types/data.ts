export type PlayerId = 'alien' | 'native';

export type Cell = {
  id: number;
  dominant?: PlayerId;
  regenerate_turns_left?: number;
};

export type Piece = {
  id: number;
  type: 'alien' | 'native';
  cardId: CardId;
  cellId: number;
  placedTurn: number; // 成長判定のために配置ターンを記録
};

export type Environment = {
  current: number;
  max: number;
};

export type TargetType =
  | 'self'
  | 'cell'
  | 'piece'
  | 'range_selection'
  | 'target_alien_and_its_dominant_cells';

// Card
export type CardId = string;

export type CardMaster = {
  id: CardId;
  name: string;
  description: string;
  cost: number;
  cooldown: number;
  target_type: TargetType;
  // TODO: effectは将来的には関数などで定義できるようにしたい
  effect: any;
};

export type AlienMaster = CardMaster & {
  // 成長条件
  growth_conditions?: {
    turn?: number;
  };
  // 成長後の姿
  next_alien_id?: CardId;
};

export type NativeMaster = CardMaster & {
  // 駆除カードの場合
  power?: number;
  // 回復カードの場合
  recovery?: number;
  // 使用回数制限
  usageLimit?: number;
};

// ----------------------------------------------------------------
// GameLog: ゲームの操作ログ
// ----------------------------------------------------------------

/**
 * 1回の操作内容
 * @property type - 操作の種類
 * @property payload - 操作に関するデータ
 */
export type PlayLog = {
  type: 'PLACE_PIECE' | 'USE_CARD' | 'END_TURN';
  payload: {
    playerId: PlayerId;
    cardId?: CardId;
    cellId?: number;
    targetCellIds?: number[];
  };
};

/** ゲーム全体のログ */
export type GameLog = PlayLog[];

// ----------------------------------------------------------------
// GameState: ゲームの状態
// ----------------------------------------------------------------
/**
 * player_turn: プレイヤーの操作待ち
 * resolving: ターン終了後の自動処理中
 * ended: ゲーム終了
 */
export type GameStatus = 'player_turn' | 'resolving' | 'ended';

export type GameState = {
  turn: number;
  currentPlayerId: PlayerId;
  gameStatus: GameStatus;
  winner: PlayerId | 'draw' | null;
  cells: Cell[];
  pieces: Piece[];
  environment: {
    alien: Environment;
    native: Environment;
  };
  // 各カードのクールダウン状況
  cooldowns: {
    [key: CardId]: number;
  };
  gameLog: GameLog;
};