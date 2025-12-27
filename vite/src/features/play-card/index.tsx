import { ActionRegistry } from "@/app/registry/ActionRegistry";
import { InteractionRegistry } from "@/app/registry/InteractionRegistry";
import { Outline } from "@/shared/components/3d/Outline"; // Sharedから汎用部品をimport
import { playCardLogic } from "./domain/playCardLogic";
import { getEffectRange } from "./domain/effectCalculator";
import cardMasterData from "@/data/cardMasterData";
import PreviewPiece from "./ui/PreviewPiece"; // 以前のガイド用コンポーネント
export {default as ActionButtons} from "./ui/ActionButtons";

export const initPlayCard = () => {
  ActionRegistry.register("PLAY_CARD", playCardLogic);

  InteractionRegistry.register({
    /** * 射程ガイドの表示ロジック
     * play-card機能が「Outline部品」をどう使うかを決定する
     */
    getCellOverlays: (cell, state, uiState) => {
      if (!uiState.isCardPreview || !uiState.previewPlacement || !uiState.selectedCardId) return null;

      const cardDefId = uiState.selectedCardId.split("-instance-")[0];
      const cardDef = cardMasterData.find(c => c.id === cardDefId);
      if (!cardDef) return null;

      const targetCell = state.gameField.cells[uiState.previewPlacement.y][uiState.previewPlacement.x];
      const range = getEffectRange(cardDef, targetCell, state.gameField, state.playerStates[state.activePlayerId].facingFactor);
      
      const isInRange = range.some(c => c.x === cell.x && c.y === cell.y);
      const isCenter = cell.x === uiState.previewPlacement.x && cell.y === uiState.previewPlacement.y;

      // 効果範囲内にあり、かつ中心点（ガイドがいる場所）以外に緑のアウトラインを表示
      if (isInRange && !isCenter) {
        return (
          <Outline 
            color="#32CD32" 
            size={0.65}      // ここでサイズを調整
            thickness={0.08} // ここで太さを調整
          />
        );
      }
      return null;
    },

    getGlobalComponents: (_state, uiState, boardRef) => {
      if (!uiState.isCardPreview || !uiState.previewPlacement || !uiState.selectedCardId) return null;
      const cardDef = cardMasterData.find(c => c.id === uiState.selectedCardId?.split("-instance-")[0]);
      if (!cardDef) return null;

      return <PreviewPiece card={cardDef} position={uiState.previewPlacement} boardRef={boardRef} />;
    },

    onCellClick: () => false
  });
};