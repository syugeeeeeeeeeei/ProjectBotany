import { ActionRegistry } from "@/app/registry/ActionRegistry";
import { InteractionRegistry } from "@/app/registry/InteractionRegistry";
import { Outline } from "@/shared/components/3d/Outline";
import { playCardLogic } from "./domain/playCardLogic";
import { getEffectRange } from "./domain/effectCalculator";
import cardMasterData from "@/data/cardMasterData";
import PreviewPiece from "./ui/PreviewPiece";
import ActionButtons from "./ui/ActionButtons";

export { default as ActionButtons } from "./ui/ActionButtons";

export const initPlayCard = () => {
  ActionRegistry.register("PLAY_CARD", playCardLogic);

  InteractionRegistry.register({
    featureKey: "play-card", // 📢 識別キーを追加

    getCellOverlays: (cell, state, uiState) => {
      if (!uiState.isCardPreview || !uiState.previewPlacement || !uiState.selectedCardId) return null;
      const cardDefId = uiState.selectedCardId.split("-instance-")[0];
      const cardDef = cardMasterData.find(c => c.id === cardDefId);
      if (!cardDef) return null;

      const targetCell = state.gameField.cells[uiState.previewPlacement.y][uiState.previewPlacement.x];
      const range = getEffectRange(cardDef, targetCell, state.gameField, state.playerStates[state.activePlayerId].facingFactor);
      if (range.some(c => c.x === cell.x && c.y === cell.y) && (cell.x !== uiState.previewPlacement.x || cell.y !== uiState.previewPlacement.y)) {
        return <Outline color="#32CD32" size={0.65} thickness={0.08} />;
      }
      return null;
    },

    getGlobalComponents: (_state, uiState, boardRef) => {
      if (!uiState.isCardPreview || !uiState.previewPlacement || !uiState.selectedCardId) return null;
      const cardDef = cardMasterData.find(c => c.id === uiState.selectedCardId?.split("-instance-")[0]);
      if (!cardDef) return null;
      return <PreviewPiece card={cardDef} position={uiState.previewPlacement} boardRef={boardRef} />;
    },

    /** 📢 UIスロットへの登録：プレビュー中のみ自分のサイドにボタンを表示 */
    getSlotComponents: (slot, state, uiState, context) => {
      if (slot === "side-panel-action-area" && uiState.isCardPreview && state.activePlayerId === context.player) {
        return <ActionButtons />;
      }
      return null;
    },

    onCellClick: () => false
  });
};