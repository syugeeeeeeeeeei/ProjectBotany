// vite/src/core/types/architecture.ts
import { ReactNode } from "react";

/** UIを配置できるスロットの定義 */
export type UISlot = "main-3d" | "ui-overlay";

export interface GameFeature {
  key: string;
  /** Featureの初期化ロジック (戻り値はクリーンアップ関数) */
  init?: () => () => void;

  /** * UIレンダリング関数 (Control Inversion)
   * Coreはスロットを提示し、Featureは自身の判断でReactNodeまたはnullを返す
   * これにより、CoreはFeatureの具体的なPropsを知る必要がなくなる
   */
  renderUI: (slot: UISlot) => ReactNode | null;
}