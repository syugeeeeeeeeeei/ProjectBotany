import { ActionRegistry } from "@/app/registry/ActionRegistry";
import { InteractionRegistry } from "@/app/registry/InteractionRegistry";
import { Outline } from "@/shared/components/3d/Outline";
import { moveAlienLogic } from "./domain/moveAlienLogic";

export const initMoveAlien = () => {
  ActionRegistry.register("MOVE_ALIEN", moveAlienLogic);

  InteractionRegistry.register({
    getDecoration: (cell, _state, uiState) => {
      if (!uiState.selectedAlienInstanceId) return null;
      // 選択中のコアを青く光らせる
      if (cell.cellType === "alien_core" && cell.alienInstanceId === uiState.selectedAlienInstanceId) {
        return { emissiveColor: "#4488FF", emissiveIntensity: 1.5 };
      }
      return null;
    },

    getCellOverlays: (cell, _state, uiState) => {
      if (!uiState.selectedAlienInstanceId) return null;
      // 移動先（自分が支配している侵略マス）に水色のアウトラインを表示
      if (cell.cellType === "alien_invasion_area" && cell.dominantAlienInstanceId === uiState.selectedAlienInstanceId) {
        return <Outline color="#87CEEB" size={0.65} thickness={0.08} />;
      }
      return null;
    },

    onCellClick: (
      cell, 
      _state,
      uiState,
      dispatch,
    ): boolean => {
      const { selectedAlienInstanceId, selectAlienInstance } = uiState;

      // コアをクリックした時：選択/解除
      if (cell.cellType === "alien_core") {
        if (selectedAlienInstanceId === cell.alienInstanceId) {
          selectAlienInstance(null); // すでに選択中なら解除
        } else {
          selectAlienInstance(cell.alienInstanceId); // 選択
        }
        return true;
      }

      // 選択中に移動先をクリックした時：移動実行
      if (
        selectedAlienInstanceId &&
        cell.cellType === "alien_invasion_area" &&
        cell.dominantAlienInstanceId === selectedAlienInstanceId
      ) {
        dispatch("MOVE_ALIEN", {
          instanceId: selectedAlienInstanceId,
          targetCell: cell,
        });
        return true;
      }

      // どこでもない場所をクリックしたら選択解除（この機能が責任を持つ場合）
      if (selectedAlienInstanceId) {
        selectAlienInstance(null);
        return true;
      }

      return false;
    },
  });
};