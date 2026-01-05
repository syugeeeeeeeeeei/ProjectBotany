// vite/src/shared/types/actions.ts

/**
 * アクションログの基底インターフェース
 * T: 具体的なPayloadの型 (デフォルトは unknown で中身を隠蔽する)
 */
export interface ActionLog<T = unknown> {
  /** ログのユニークID */
  actionId: string;
  /** アクション識別子 (例: 'PLAY_CARD', 'ROUND_CHANGE') */
  type: string;
  /** アクションの詳細データ (Featureごとに定義) */
  payload: T;
  /** 実行時刻 */
  timestamp: number;
  /** 実行時のラウンド数 */
  round: number;
}