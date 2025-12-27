import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { GAME_SETTINGS } from "@/shared/constants/game-config";
import {
  GameState,
  PlayerType,
  PlayerState,
  CellState,
  ActionLog,
} from "@/shared/types/game-schema";
import { createNativeAreaCell } from "@/features/field-grid/domain/cellHelpers";
import cardMasterData from "@/data/cardMasterData";
import { ActionRegistry } from "@/app/registry/ActionRegistry";
import { generateId } from "@/shared/utils/id";

/**
 * ストアが提供するアクション（関数）の定義
 */
interface GameActions {
  /**
   * 📢 万能アクション実行関数（Dispatcher）
   * * 全てのゲーム内操作（カード使用、移動、ターン終了等）はこの関数を経由します。
   * 1. ActionRegistry から指定された type のロジックを取得
   * 2. ロジックを実行して新しい状態を計算
   * 3. 実行内容を history (棋譜) に保存
   * 4. 状態を反映
   * * @param type アクションの種類 (例: 'PLAY_CARD', 'MOVE_ALIEN')
   * @param payload アクションに必要なデータ
   * @returns エラー時は文字列、成功時は void
   */
  dispatch: (type: string, payload: any) => string | void;

  /** * @deprecated dispatch('PLAY_CARD', ...) を使用してください。
   * 既存コンポーネントとの互換性のために残されています。
   */
  playCard: (cardId: string, targetCell: CellState) => string | void;

  /** * @deprecated dispatch('MOVE_ALIEN', ...) を使用してください。
   */
  moveAlien: (instanceId: string, targetCell: CellState) => string | void;

  /** * @deprecated dispatch('PROGRESS_TURN') を使用してください。
   */
  progressTurn: () => void;

  /**
   * ゲームの状態を初期化（タイトルに戻る際などに使用）
   */
  resetGame: () => void;
}

/**
 * プレイヤーの初期状態を生成するヘルパー
 */
const createInitialPlayerState = (
  id: PlayerType,
  name: string,
): PlayerState => ({
  playerId: id,
  playerName: name,
  facingFactor: id === "native" ? -1 : 1, // 在来種は奥（上）向き
  initialEnvironment: 1,
  currentEnvironment: 1,
  maxEnvironment: 1,
  cardLibrary: [],
  cooldownActiveCards: [],
  limitedCardsUsedCount: {},
});

/**
 * フィールド（盤面）の初期状態を生成するヘルパー
 */
const createInitialFieldState = () => {
  const { FIELD_WIDTH, FIELD_HEIGHT } = GAME_SETTINGS;
  // 全てのマスを「在来種（緑）」で埋め尽くした状態で開始
  const cells = Array.from({ length: FIELD_HEIGHT }, (_, y) =>
    Array.from({ length: FIELD_WIDTH }, (_, x) => createNativeAreaCell(x, y)),
  );
  return { width: FIELD_WIDTH, height: FIELD_HEIGHT, cells };
};

/**
 * ゲーム開始時の完全な初期状態を生成
 */
const createInitialGameState = (): GameState => ({
  currentTurn: 1,
  maximumTurns: GAME_SETTINGS.MAXIMUM_TURNS,
  activePlayerId: "alien", // 先攻は外来種
  currentPhase: "summon_phase",
  isGameOver: false,
  winningPlayerId: null,
  gameField: createInitialFieldState(),
  playerStates: {
    native: createInitialPlayerState("native", "在来種"),
    alien: createInitialPlayerState("alien", "外来種"),
  },
  activeAlienInstances: {},
  nativeScore: 0,
  alienScore: 0,
  history: [], // 📜 棋譜履歴の初期化
});

/**
 * 🎮 Project Botany メインゲームストア（useGameStore）
 * 
 * 【動機】
 * ゲームコアの「ステート（状態）」と「遷移（アクション）」を中央集権的に管理するためです。
 * 複雑なボードゲームのロジックを、React のコンポーネントから分離し、
 * 単一の信頼できる情報源（Single Source of Truth）として機能させます。
 *
 * 【恩恵】
 * - Zustand + Immer により、複雑なネストを持つゲーム状態を、破壊的変更を気にせず直感的に記述できます。
 * - `dispatch` 方式によるプラグインアークテクチャにより、新機能の追加がストア自体の変更なしで可能です。
 * - `history`（棋譜）にすべてのアクションが記録されるため、将来的な「一手戻す」機能やリプレイの実装が容易です。
 *
 * 【使用法】
 * 1. コンポーネント内で `const game = useGameStore()` としてフックを呼び出します。
 * 2. 状態の読み取り（`game.gameField` 等）や、アクションの実行（`game.dispatch('TYPE', payload)`）に使用します。
 */
export const useGameStore = create(
  immer<GameState & GameActions>((set, get) => ({
    // 初期状態の展開
    ...createInitialGameState(),

    /**
     * アクションの振り分けと実行
     * すべてのゲーム状態変更をこの1つの入口に集約することで、
     * ログの記録（履歴）、機能拡張、デバッグを共通化するために必要です。
     */
    dispatch: (type, payload) => {
      // 1. レジストリからロジック（純粋関数）を検索
      const logic = ActionRegistry.get(type);
      if (!logic) {
        console.warn(`Action "${type}" is not registered or disabled.`);
        return "機能が無効化されています。";
      }

      // 2. 現在の状態をもとに新しい状態を計算
      // ロジック関数は (state, payload) => newState | errorString の形式
      const result = logic(get(), payload);

      // 文字列が返ってきた場合はバリデーションエラーとして扱う
      // ロジック側で「コスト不足」などのエラーを簡単に返せるようにするために必要です
      if (typeof result === "string") {
        return result;
      }

      // 3. 状態の更新と履歴の保存
      set((state) => {
        // 📜 棋譜（アクションログ）の作成
        // この履歴を保存し続けることで、リプレイ機能やデバッグが容易になります。
        const log: ActionLog = {
          actionId: generateId(),
          type,
          payload,
          timestamp: Date.now(),
          turn: state.currentTurn,
        };
        state.history.push(log);

        // 最新の計算結果を現在の状態にマージ
        // immer の draft(state) に対して Object.assign を使うことで安全に一括更新
        Object.assign(state, result);
      });
    },

    // --- Legacy Wrappers ---
    // これらは内部的に dispatch を呼び出すだけの薄いラッパーです。
    // UI側のコードを一度に書き換えるリスクを避けるために維持されています。

    /**
     * カードを使用する（レガシー互換用）
     * 以前のコードベースからスムーズにプラグインアーキテクチャへ移行するために必要です
     */
    playCard: (cardId, targetCell) => {
      // インスタンスIDからマスターデータのIDを抽出
      const cardDefId = cardId.split("-instance-")[0];
      const card = cardMasterData.find((c) => c.id === cardDefId);
      if (!card) return "カードデータが見つかりません。";

      // dispatch 形式に変換して実行
      return get().dispatch("PLAY_CARD", { card, targetCell, cardId });
    },

    /**
     * 外来種を移動する（レガシー互換用）
     */
    moveAlien: (instanceId, targetCell) => {
      return get().dispatch("MOVE_ALIEN", { instanceId, targetCell });
    },

    /**
     * ターンを進行させる（レガシー互換用）
     */
    progressTurn: () => {
      // ターン進行にペイロードは不要なので空オブジェクトを渡す
      get().dispatch("PROGRESS_TURN", {});
    },

    /**
     * ゲームを最初からやり直す
     */
    resetGame: () => set(createInitialGameState()),
  })),
);
