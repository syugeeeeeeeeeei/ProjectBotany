import { ActionRegistry } from "@/app/registry/ActionRegistry";
import { InteractionRegistry } from "@/app/registry/InteractionRegistry";
import { progressTurnLogic } from "./domain/turnLogic";
import { GAME_SETTINGS } from "@/shared/constants/game-config";
import TurnEndButton from "./ui/TurnEndButton";

export { default as TurnEndButton } from "./ui/TurnEndButton";

/**
 * 🌿 Turn System Feature (ターン管理機能)
 * 
 * 【動機】
 * ゲームの進行サイクル（プレイヤーの交代、ターンのカウント、勝利判定）を制御するためです。
 * プレイヤーが操作を終えた後の後処理と、次のプレイヤーへの権限移譲を一括管理します。
 *
 * 【恩恵】
 * - `InteractionRegistry` を介して、サイドパネルの適切な位置に「ターン終了」ボタンを
 *   自律的に注入できます。
 * - ゲーム設定（`GAME_SETTINGS`）に基づいて、機能の有効・無効を容易に切り替えられます。
 *
 * 【使用法】
 * `pluginLoader.ts` から初期化されます。内部で `TurnEndButton` の表示条件（プレビュー中でない等）
 * を定義しています。
 */
export const initTurnSystem = () => {
  // ターン進行アクション（ロジック）の登録
  if (GAME_SETTINGS.FEATURE_FLAGS.ENABLE_TURN_SYSTEM) {
    ActionRegistry.register("PROGRESS_TURN", progressTurnLogic);
  }

  // UIスロットの登録
  InteractionRegistry.register({
    featureKey: "turn-system",

    /**
     * UIスロットへの登録
     * カードプレビュー（配置検討中）でない場合に限り、自分のサイドパネルに「ターン終了」ボタンを注入するために必要です
     */
    getSlotComponents: (slot, state, uiState, context) => {
      if (slot === "side-panel-action-area" && !uiState.isCardPreview) {
        return <TurnEndButton player={ context.player } />;
      }
      return null;
    }
  });
};