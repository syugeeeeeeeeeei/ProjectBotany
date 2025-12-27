import React from "react";
import { CellState, GameState } from "@/shared/types/game-schema";

/**
 * マスの基本的な装飾データ
 */
export interface CellDecoration {
  emissiveColor?: string;
  emissiveIntensity?: number;
}

/**
 * 各機能が提供するUI/挙動のプロバイダー
 */
export interface InteractionProvider {
  /** マスの色などの装飾データを取得 */
  getDecoration?: (cell: CellState, state: GameState, uiState: any) => CellDecoration | null;
  /** マスの上に重ねる追加のUI（Outline等）を取得 */
  getCellOverlays?: (cell: CellState, state: GameState, uiState: any) => React.ReactNode;
  /** 盤面全体に対して描画するグローバルUI（ドラッグ中のガイド等）を取得 */
  getGlobalComponents?: (state: GameState, uiState: any, boardRef: React.RefObject<any>) => React.ReactNode;
  /** クリック時の挙動 */
  onCellClick?: (cell: CellState, state: GameState, uiState: any, dispatch: any) => boolean;
}

const providers: InteractionProvider[] = [];

export const InteractionRegistry = {
  register: (provider: InteractionProvider) => {
    providers.push(provider);
  },

  getCombinedDecoration: (cell: CellState, state: GameState, uiState: any): CellDecoration => {
    const combined: CellDecoration = {};
    for (const p of providers) {
      const deco = p.getDecoration?.(cell, state, uiState);
      if (deco) Object.assign(combined, deco);
    }
    return combined;
  },

  getCellOverlays: (cell: CellState, state: GameState, uiState: any): React.ReactNode[] => {
    return providers
      .map((p, i) => {
        const node = p.getCellOverlays?.(cell, state, uiState);
        return node ? <React.Fragment key={`cell-overlay-${i}`}>{node}</React.Fragment> : null;
      })
      .filter(n => n !== null) as React.ReactNode[];
  },

  getGlobalComponents: (state: GameState, uiState: any, boardRef: React.RefObject<any>): React.ReactNode[] => {
    return providers
      .map((p, i) => {
        const node = p.getGlobalComponents?.(state, uiState, boardRef);
        return node ? <React.Fragment key={`global-comp-${i}`}>{node}</React.Fragment> : null;
      })
      .filter(n => n !== null) as React.ReactNode[];
  },

  invokeClick: (cell: CellState, state: GameState, uiState: any, dispatch: any) => {
    for (const p of providers) {
      if (p.onCellClick?.(cell, state, uiState, dispatch)) return;
    }
  }
};