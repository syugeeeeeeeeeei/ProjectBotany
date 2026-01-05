// vite/src/core/types/architecture.ts

/** UIを配置できるスロットの定義 */
export type UISlot = "main-3d" | "ui-overlay";

/** * Featureが提供するUIコンポーネント定義 (保持用)
 * 配列に格納するため、ここでは具体的なPropsの型は問わない (unknown)
 */
export interface FeatureComponentConfig {
  id: string;
  slot: UISlot;
  // どのようなPropsのコンポーネントでも受け入れられるように ComponentType<any> 相当が必要だが、
  // ESLint回避と意味合いのために unknown を使用しつつ、使用側で適切にキャストされることを想定
  Component: React.ComponentType<unknown>;
  props?: Record<string, unknown>;
}

export interface GameFeature {
  key: string;
  /** Featureの初期化ロジック (戻り値はクリーンアップ関数) */
  init?: () => () => void;
  /** Featureが配置するUIコンポーネント */
  components?: FeatureComponentConfig[];
}

/**
 * 型安全にFeatureコンポーネント定義を作成するファクトリ関数
 * ここで Generics <P> を使うことで、Componentとpropsの型整合性をチェックする
 */
export const defineFeatureComponent = <P extends Record<string, unknown>>(
  config: {
    id: string;
    slot: UISlot;
    Component: React.ComponentType<P>;
    props?: P;
  }
): FeatureComponentConfig => {
  // 内部的には型情報を消去して FeatureComponentConfig として扱う
  return config as unknown as FeatureComponentConfig;
};