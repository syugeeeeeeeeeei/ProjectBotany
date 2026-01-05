// vite/src/app/GameRoot.tsx
import React, { useEffect } from "react";
import { GameLayout } from "@/core/ui/GameLayout";
import { initializeGameComposition } from "./GameComposition";
import { FeaturesRegistry } from "./FeaturesRegistry";

export const GameRoot: React.FC = () => {
  // 1. システム初期化 & Feature Logic 起動
  useEffect(() => {
    // Core初期化
    initializeGameComposition();

    // 全FeatureのLogic初期化を実行
    const cleanups: (() => void)[] = [];
    FeaturesRegistry.forEach((feature) => {
      if (feature.init) {
        const cleanup = feature.init();
        if (cleanup) cleanups.push(cleanup);
      }
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  // 2. コンポーネントの振り分け
  const overlayComponents = FeaturesRegistry.flatMap((f) => f.components ?? [])
    .filter((c) => c.slot === "ui-overlay")
    .map((c) => <c.Component key={c.id} {...c.props} />);

  const main3dComponents = FeaturesRegistry.flatMap((f) => f.components ?? [])
    .filter((c) => c.slot === "main-3d")
    .map((c) => <c.Component key={c.id} {...c.props} />);

  return (
    <GameLayout uiOverlay={<>{overlayComponents}</>}>
      {main3dComponents}
    </GameLayout>
  );
};
