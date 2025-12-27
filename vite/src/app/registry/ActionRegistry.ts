import { GameState } from "@/shared/types/game-schema";

/** アクションロジックの型定義 */
export type ActionLogic = (
  state: GameState,
  payload: any,
) => GameState | string;

/** レジストリの実体 */
const registry: Record<string, ActionLogic> = {};

/**
 * アクションロジックを管理するレジストリ
 * 機能（Feature）は初期化時に自身のロジックをここに登録する。
 * Storeはこのレジストリを通じてロジックを実行する。
 */
export const ActionRegistry = {
  /**
   * アクションロジックを登録する
   * @param type アクション名 (例: 'MOVE_ALIEN')
   * @param logic 実行するロジック関数
   */
  register: (type: string, logic: ActionLogic) => {
    registry[type] = logic;
    console.log(`Action registered: ${type}`);
  },

  /**
   * 登録されたロジックを取得する
   * @param type アクション名
   */
  get: (type: string): ActionLogic | undefined => {
    return registry[type];
  },

  /**
   * 指定されたアクションが登録されているか（機能が有効か）を確認する
   * UI側でボタンの表示/非表示を切り替える際などに使用する
   */
  has: (type: string): boolean => {
    return !!registry[type];
  },
};
