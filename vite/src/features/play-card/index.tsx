import { ActionRegistry } from "@/app/registry/ActionRegistry";
import { InteractionRegistry } from "@/app/registry/InteractionRegistry";
import { Outline } from "@/shared/components/3d/Outline";
import { playCardLogic } from "./domain/playCardLogic";
import { getEffectRange } from "./domain/effectCalculator";
import cardMasterData from "@/data/cardMasterData";
import PreviewPiece from "./ui/PreviewPiece";
import ActionButtons from "./ui/ActionButtons";

/**
 * 🌿 Play Card Feature (カード使用機能)
 * 
 * 【動機】
 * ゲームの主要なインタラクションである「カードの使用」を実現するためです。
 * カードを手札から盤面へドラッグし、配置位置に応じた効果範囲を表示し、
 * 最終的な実行（召喚/発動）ボタンを提供するまでの一連のフローを統合します。
 *
 * 【恩恵】
 * - `InteractionRegistry` を通じて、盤面に対して動的な「効果範囲のアウトライン」を
 *   重ねて表示し、ユーザーが効果を事前に把握できるようにします。
 * - `PreviewPiece` コンポーネントをグローバル UI スロットに注入することで、
 *   ドラッグ操作による直感的なターゲティングを実現します。
 * - `ActionButtons` をサイドパネル領域に表示し、3D 的な操作と 2D 的な決定を組み合わせて提供します。
 *
 * 【使用法】
 * `pluginLoader.ts` から初期化され、`useUIStore` の `isCardPreview` フラグが
 * 立っている間に各レジストリが活性化します。
 */
export { default as ActionButtons } from "./ui/ActionButtons";

export const initPlayCard = () => {
  // アクションを登録
  ActionRegistry.register("PLAY_CARD", playCardLogic);

  InteractionRegistry.register({
    featureKey: "play-card",

    /**
     * 各マスへの重ね合わせコンポーネント（アウトライン）の取得
     * カードの「効果範囲」を盤面上にリアルタイムに可視化し、戦略的な判断を助けるために必要です
     */
    getCellOverlays: (cell, state, uiState) => {
      if (!uiState.isCardPreview || !uiState.previewPlacement || !uiState.selectedCardId) return null;
      
      // 選択中カードの定義を取得
      const cardDefId = uiState.selectedCardId.split("-instance-")[0];
      const cardDef = cardMasterData.find(c => c.id === cardDefId);
      if (!cardDef) return null;

      // プレビュー位置（ターゲット）に基づいた影響範囲を計算
      const targetCell = state.gameField.cells[uiState.previewPlacement.y][uiState.previewPlacement.x];
      const range = getEffectRange(cardDef, targetCell, state.gameField, state.playerStates[state.activePlayerId].facingFactor);
      
      // 計算された範囲内のマスにのみ、アウトラインを描画
      if (range.some(c => c.x === cell.x && c.y === cell.y) && (cell.x !== uiState.previewPlacement.x || cell.y !== uiState.previewPlacement.y)) {
        return <Outline color="#32CD32" size={0.65} thickness={0.08} />;
      }
      return null;
    },

    /**
     * 盤面上に表示するグローバルコンポーネント（プレビュー駒）の取得
     * 選択中のカードを物理的な「駒」として配置場所に表示するために必要です
     */
    getGlobalComponents: (_state, uiState, boardRef) => {
      if (!uiState.isCardPreview || !uiState.previewPlacement || !uiState.selectedCardId) return null;
      const cardDef = cardMasterData.find(c => c.id === uiState.selectedCardId?.split("-instance-")[0]);
      if (!cardDef) return null;
      return <PreviewPiece card={cardDef} position={uiState.previewPlacement} boardRef={boardRef} />;
    },

    /**
     * UIスロットへの登録
     * プレビュー中のみ自分のサイドパネルに「召喚/取消」ボタンを表示するために必要です
     */
    getSlotComponents: (slot, state, uiState, context) => {
      if (slot === "side-panel-action-area" && uiState.isCardPreview && state.activePlayerId === context.player) {
        return <ActionButtons />;
      }
      return null;
    },

    onCellClick: () => false // プレビュー中はセルの直接クリックは無効化（ボタンで決定するため）
  });
};