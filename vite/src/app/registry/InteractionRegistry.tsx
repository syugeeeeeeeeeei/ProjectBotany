import React from "react";
import { CellState, GameState, PlayerType } from "@/shared/types/game-schema";
import { ENABLED_FEATURES, FeatureKey } from "@/app/featuer-setting/config";

/** UIスロットの定義 */
export type UISlotName = "side-panel-action-area";

/**
 * 各機能が提供するUI/挙動のプロバイダー（InteractionRegistry）
 * 
 * 【動機】
 * 盤面（GameBoard）やUIパネルなどの共通コンポーネントに対して、各機能が独自の表示や挙動を注入できるようにするためです。
 * 例えば「移動機能」が移動可能範囲を表示したり、「カード機能」がプレビューを表示したりする際、
 * メインのUIループを汚染せずにプラグイン形式で機能を追加できます。
 *
 * 【恩恵】
 * - 複数の機能が同じマスに対して異なる装飾（Decoration）やオーバーレイを重ねることができます。
 * - UIスロット（Slot）の概念により、サイドパネル等の特定の場所に複数の機能からボタンや情報を集約できます。
 * - 有効な機能（ENABLED_FEATURES）のプロバイダーのみが実行されるため、安全に機能のトグルが可能です。
 *
 * 【使用法】
 * 1. `InteractionProvider` インターフェースを実装したオブジェクトを作成します。
 * 2. 機能の初期化時に `InteractionRegistry.register(provider)` で登録します。
 * 3. 共通UI（`GameBoard3D` 等）の中で `getCombinedDecoration` や `getCellOverlays` を呼び出して利用します。
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
  /**
   * インタラクションプロバイダーを登録する
   * 各機能（Features）が自身の初期化時に、UIへの介入ポイントを定義するために必要です
   */
  register: (provider: InteractionProvider) => {
    providers.push(provider);
  },

  /**
   * 指定されたUIスロット（サイドパネルなど）に表示するコンポーネントを取得する
   * 各機能が特定の場所に独自のボタンや情報を統合して表示するために必要です
   */
  getComponentsForSlot: (slot: UISlotName, state: GameState, uiState: any, context: { player: PlayerType }): React.ReactNode[] => {
    return providers
      .filter(p => ENABLED_FEATURES[p.featureKey])
      .map((p, i) => {
        const node = p.getSlotComponents?.(slot, state, uiState, context);
        return node ? <React.Fragment key={`${slot}-${i}`}>{node}</React.Fragment> : null;
      })
      .filter(n => n !== null) as React.ReactNode[];
  },

  /**
   * マスの装飾データ（色、発光など）を、有効なすべての機能から統合して取得する
   * 複数の機能（移動範囲とカード射程など）が同時に同じマスを強調したい場合に必要です
   */
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

  /**
   * マスの上に重畳するUI（Outline等）のリストを取得する
   * 盤面の見た目を動的に装飾するために必要です
   */
  getCellOverlays: (cell: CellState, state: GameState, uiState: any): React.ReactNode[] => {
    return providers
      .filter(p => ENABLED_FEATURES[p.featureKey])
      .map((p, i) => {
        const node = p.getCellOverlays?.(cell, state, uiState);
        return node ? <React.Fragment key={`cell-overlay-${i}`}>{node}</React.Fragment> : null;
      })
      .filter(n => n !== null) as React.ReactNode[];
  },

  /**
   * 盤面全体に影響するグローバルコンポーネントのリストを取得する
   * 盤面のドラッグガイドや、特定の座標に依存しないUIを表示するために必要です
   */
  getGlobalComponents: (state: GameState, uiState: any, boardRef: React.RefObject<any>): React.ReactNode[] => {
    return providers
      .filter(p => ENABLED_FEATURES[p.featureKey])
      .map((p, i) => {
        const node = p.getGlobalComponents?.(state, uiState, boardRef);
        return node ? <React.Fragment key={`global-comp-${i}`}>{node}</React.Fragment> : null;
      })
      .filter(n => n !== null) as React.ReactNode[];
  },

  /**
   * マスクリックイベントを各機能に順次通知し、処理された場合はそこで停止する
   * 複数の機能が「クリック」を取り合う際、優先順位（登録順）に従って適切に制御するために必要です
   */
  invokeClick: (cell: CellState, state: GameState, uiState: any, dispatch: any) => {
    for (const p of providers) {
      if (ENABLED_FEATURES[p.featureKey] && p.onCellClick?.(cell, state, uiState, dispatch)) return;
    }
  }
};