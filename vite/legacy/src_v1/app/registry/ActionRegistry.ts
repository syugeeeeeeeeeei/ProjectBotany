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
 * 
 * 【動機】
 * ゲームの各機能（Feature）が持つビジネスロジックを、グローバルな Store（Zustandなど）から切り離し、
 * プラグインのように動的に追加・更新できるようにするためです。
 * これにより、新しいアクションを追加する際に、Store 自体のコードを修正する必要がなくなります。
 *
 * 【恩恵】
 * - 各機能が自身の初期化フェーズでロジックを登録するため、機能のパージ（切り離し）が容易です。
 * - 中央集権的な `switch` 文を排除でき、コードの肥大化を防ぎます。
 * - `has()` メソッドにより、特定の機能が現在有効かどうかを UI 側から簡単に判断できます。
 *
 * 【使用法】
 * 1. 各機能の初期化時（`initXxx()`）に `ActionRegistry.register('ACTION_NAME', logicFn)` を呼び出します。
 * 2. Store 側では `ActionRegistry.get(actionType)` で実行関数を取得し、状態更新を行います。
 */
export const ActionRegistry = {
  /**
   * アクションロジックを登録する
   * 機能（Feature）のロード時に、その機能独自の更新ルールをシステムに組み込むために必要です
   * @param type アクション名 (例: 'MOVE_ALIEN')
   * @param logic 実行するロジック関数
   */
  register: (type: string, logic: ActionLogic) => {
    registry[type] = logic;
    console.log(`Action registered: ${type}`);
  },

  /**
   * 登録されたロジックを取得する
   * ストアの `dispatch` メソッドにおいて、アクション名から実体となる関数を引き出すために必要です
   * @param type アクション名
   */
  get: (type: string): ActionLogic | undefined => {
    return registry[type];
  },

  /**
   * 指定されたアクションが登録されているか（機能が有効か）を確認する
   * UI側で「機能フラグが有効な場合のみボタンを出す」といった動的な表示制御を行うために必要です
   */
  has: (type: string): boolean => {
    return !!registry[type];
  },
};
