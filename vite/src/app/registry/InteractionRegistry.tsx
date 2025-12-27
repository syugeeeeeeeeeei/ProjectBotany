import React from "react";
import { CellState, GameState, PlayerType } from "@/shared/types/game-schema";
import { ENABLED_FEATURES, FeatureKey } from "@/app/featuer-setting/config";

/** UIスロットの定義 */
export type UISlotName = "side-panel-action-area";

/**
 * 各機能が提供するUI/挙動のプロバイダー
 */
export interface InteractionProvider {
  /** このUIを提供している機能のキー */
  featureKey: FeatureKey;
  /** マスの色などの装飾データを取得 */
  getDecoration?: (cell: CellState, state: GameState, uiState: any) => CellDecoration | null;
  /** マスの上に重ねる追加のUI（Outline等）を取得 */
  getCellOverlays?: (cell: CellState, state: GameState, uiState: any) => React.ReactNode;
  /** 盤面全体に対して描画するグローバルUI（ガイド等）を取得 */
  getGlobalComponents?: (state: GameState, uiState: any, boardRef: React.RefObject<any>) => React.ReactNode;
  /** 📢 特定のスロットに表示するUIを取得 */
  getSlotComponents?: (slot: UISlotName, state: GameState, uiState: any, context: { player: PlayerType }) => React.ReactNode;
  /** クリック時の挙動 */
  onCellClick?: (cell: CellState, state: GameState, uiState: any, dispatch: any) => boolean;
}

export interface CellDecoration {
  emissiveColor?: string;
  emissiveIntensity?: number;
}

const providers: InteractionProvider[] = [];

export const InteractionRegistry = {
  register: (provider: InteractionProvider) => {
    providers.push(provider);
  },

  /** 📢 スロットに登録されたコンポーネントを、有効な機能からのみ取得 */
  getComponentsForSlot: (slot: UISlotName, state: GameState, uiState: any, context: { player: PlayerType }): React.ReactNode[] => {
    return providers
      .filter(p => ENABLED_FEATURES[p.featureKey])
      .map((p, i) => {
        const node = p.getSlotComponents?.(slot, state, uiState, context);
        return node ? <React.Fragment key={`${slot}-${i}`}>{node}</React.Fragment> : null;
      })
      .filter(n => n !== null) as React.ReactNode[];
  },

  getCombinedDecoration: (cell: CellState, state: GameState, uiState: any): CellDecoration => {
    const combined: CellDecoration = {};
    for (const p of providers) {
      if (ENABLED_FEATURES[p.featureKey]) {
        const deco = p.getDecoration?.(cell, state, uiState);
        if (deco) Object.assign(combined, deco);
      }
    }
    return combined;
  },

  getCellOverlays: (cell: CellState, state: GameState, uiState: any): React.ReactNode[] => {
    return providers
      .filter(p => ENABLED_FEATURES[p.featureKey])
      .map((p, i) => {
        const node = p.getCellOverlays?.(cell, state, uiState);
        return node ? <React.Fragment key={`cell-overlay-${i}`}>{node}</React.Fragment> : null;
      })
      .filter(n => n !== null) as React.ReactNode[];
  },

  getGlobalComponents: (state: GameState, uiState: any, boardRef: React.RefObject<any>): React.ReactNode[] => {
    return providers
      .filter(p => ENABLED_FEATURES[p.featureKey])
      .map((p, i) => {
        const node = p.getGlobalComponents?.(state, uiState, boardRef);
        return node ? <React.Fragment key={`global-comp-${i}`}>{node}</React.Fragment> : null;
      })
      .filter(n => n !== null) as React.ReactNode[];
  },

  invokeClick: (cell: CellState, state: GameState, uiState: any, dispatch: any) => {
    for (const p of providers) {
      if (ENABLED_FEATURES[p.featureKey] && p.onCellClick?.(cell, state, uiState, dispatch)) return;
    }
  }
};