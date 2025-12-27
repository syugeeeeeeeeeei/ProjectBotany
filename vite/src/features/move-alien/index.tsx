import { ActionRegistry } from "@/app/registry/ActionRegistry";
import { InteractionRegistry } from "@/app/registry/InteractionRegistry";
import { Outline } from "@/shared/components/3d/Outline";
import { moveAlienLogic } from "./domain/moveAlienLogic";

export const initMoveAlien = () => {
  ActionRegistry.register("MOVE_ALIEN", moveAlienLogic);

  InteractionRegistry.register({
    featureKey: "move-alien", // 📢 追加

    getDecoration: (cell, _state, uiState) => {
      if (!uiState.selectedAlienInstanceId) return null;
      if (cell.cellType === "alien_core" && cell.alienInstanceId === uiState.selectedAlienInstanceId) {
        return { emissiveColor: "#4488FF", emissiveIntensity: 1.5 };
      }
      return null;
    },

    getCellOverlays: (cell, _state, uiState) => {
      if (!uiState.selectedAlienInstanceId) return null;
      if (cell.cellType === "alien_invasion_area" && cell.dominantAlienInstanceId === uiState.selectedAlienInstanceId) {
        return <Outline color="#87CEEB" size={0.65} thickness={0.08} />;
      }
      return null;
    },

    onCellClick: (cell, _state, uiState, dispatch): boolean => {
      const { selectedAlienInstanceId, selectAlienInstance } = uiState;
      if (cell.cellType === "alien_core") {
        if (selectedAlienInstanceId === cell.alienInstanceId) selectAlienInstance(null);
        else selectAlienInstance(cell.alienInstanceId);
        return true;
      }
      if (selectedAlienInstanceId && cell.cellType === "alien_invasion_area" && cell.dominantAlienInstanceId === selectedAlienInstanceId) {
        dispatch("MOVE_ALIEN", { instanceId: selectedAlienInstanceId, targetCell: cell });
        return true;
      }
      if (selectedAlienInstanceId) { selectAlienInstance(null); return true; }
      return false;
    },
  });
};