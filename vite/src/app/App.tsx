// vite/src/app/App.tsx
import React, { useEffect } from "react";
import { GameLayout } from "@/core/ui/GameLayout";
import { initializeGameComposition } from "./GameComposition";
import { FeaturesRegistry } from "./FeaturesRegistry";

// コンポーネント名を App に統一 (main.tsxからの呼び出しに対応)
const App: React.FC = () => {
  // 1. システム初期化 & Feature Logic 起動
  useEffect(() => {
    // Core初期化
    initializeGameComposition();

    // 全FeatureのLogic初期化を実行
    const cleanups: (() => void)[] = [];
    FeaturesRegistry.forEach((feature) => {
      if (feature.init) {
        // initが関数を返さない場合(void)も考慮しつつ、返り値があればクリーンアップ配列へ
        const cleanup = feature.init();
        if (typeof cleanup === "function") {
          cleanups.push(cleanup);
        }
      }
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  // 2. コンポーネントの振り分け
  // ヘルパー関数: ComponentType<unknown> を JSX でレンダリングするために any にキャスト
  const renderComponents = (slot: string) => {
    return FeaturesRegistry.flatMap((f) => f.components ?? [])
      .filter((c) => c.slot === slot)
      .map((c) => {
        // ここでキャストして TypeScript エラーを回避
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Component = c.Component as React.ComponentType<any>;
        return <Component key={c.id} {...c.props} />;
      });
  };

  return (
    <GameLayout uiOverlay={<>{renderComponents("ui-overlay")}</>}>
      {renderComponents("main-3d")}
    </GameLayout>
  );
};

export default App;
