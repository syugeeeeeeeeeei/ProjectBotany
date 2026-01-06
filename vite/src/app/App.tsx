// vite/src/app/App.tsx
import React, { useEffect } from "react";
import { GameLayout } from "@/core/ui/GameLayout";
import { initializeGameComposition } from "./GameComposition";
import { FeaturesRegistry } from "./FeaturesRegistry";
import { UISlot } from "@/core/types/architecture";

const App: React.FC = () => {
  // 1. システム初期化 & Feature Logic 起動
  useEffect(() => {
    // Core初期化
    initializeGameComposition();

    // 全FeatureのLogic初期化を実行
    const cleanups: (() => void)[] = [];
    FeaturesRegistry.forEach((feature) => {
      if (feature.init) {
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

  // 2. コンポーネントの描画委譲
  // CoreはSlotを渡すだけで、中身の型を知る必要はない
  const renderSlot = (slot: UISlot) => (
    <>
      {FeaturesRegistry.map((feature) => (
        <React.Fragment key={feature.key}>
          {feature.renderUI(slot)}
        </React.Fragment>
      ))}
    </>
  );

  return (
    <GameLayout uiOverlay={renderSlot("ui-overlay")}>
      {renderSlot("main-3d")}
    </GameLayout>
  );
};

export default App;
