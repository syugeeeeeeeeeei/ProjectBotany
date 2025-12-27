import { ActionRegistry } from "@/app/registry/ActionRegistry";
import { InteractionRegistry } from "@/app/registry/InteractionRegistry";
import { progressTurnLogic } from "./domain/turnLogic";
import { GAME_SETTINGS } from "@/shared/constants/game-config";
import TurnEndButton from "./ui/TurnEndButton";

export { default as TurnEndButton } from "./ui/TurnEndButton";

export const initTurnSystem = () => {
  // ロジックの登録（既存のフラグチェックも維持）
  if (GAME_SETTINGS.FEATURE_FLAGS.ENABLE_TURN_SYSTEM) {
    ActionRegistry.register("PROGRESS_TURN", progressTurnLogic);
  }

  // UIスロットの登録
  InteractionRegistry.register({
    featureKey: "turn-system",

    /** 📢 UIスロットへの登録：プレビュー中でない時にターン終了ボタンを表示 */
    getSlotComponents: (slot, state, uiState, context) => {
      if (slot === "side-panel-action-area" && !uiState.isCardPreview) {
        return <TurnEndButton player={ context.player } />;
      }
      return null;
    }
  });
};