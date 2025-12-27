import { ActionRegistry } from "@/app/registry/ActionRegistry";
import { progressTurnLogic } from "./domain/turnLogic";
import { GAME_SETTINGS } from "@/shared/constants/game-config";

export { default as TurnEndButton } from "./ui/TurnEndButton";

/**
 * TurnSystem機能を初期化し、有効な場合はレジストリに登録する
 */
export const initTurnSystem = () => {
  if (GAME_SETTINGS.FEATURE_FLAGS.ENABLE_TURN_SYSTEM) {
    ActionRegistry.register("PROGRESS_TURN", progressTurnLogic);
  }
};
