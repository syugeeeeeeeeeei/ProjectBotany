// src/app/App.tsx
import React, { useEffect } from "react";
import { GameLayout } from "@/core/ui/GameLayout";
import { initializeGameComposition } from "./GameComposition";
import { FeaturesRegistry } from "./FeaturesRegistry"; // 設定ファイルを読み込み

export const App: React.FC = () => {
  useEffect(() => {
    initializeGameComposition();

    // 登録された全Featureのロジックを初期化
    FeaturesRegistry.forEach((f) => f.init?.());
  }, []);

  return (
    <GameLayout
      uiOverlay={
        <>
          {/* UIコンポーネントを自動配置 */}
          {FeaturesRegistry.map(
            (f) => f.components?.ui && <f.components.ui key={f.key} />,
          )}
        </>
      }
    >
      {/* 3Dコンポーネントを自動配置 */}
      {FeaturesRegistry.map(
        (f) => f.components?.main && <f.components.main key={f.key} />,
      )}
    </GameLayout>
  );
};
