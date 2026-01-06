// vite/src/app/FeaturesRegistry.ts
import { GameFeature } from "@/core/types/architecture";
import { fieldGridFeature } from "@/features/field-grid";
import { cardHandFeature } from "@/features/card-hand";
import { turnSystemFeature } from "@/features/turn-system";
import { playCardFeature } from "@/features/play-card";
import { hudFeature } from "@/features/hud";
import { alienGrowthFeature } from "@/features/alien-growth";
import { alienExpansionFeature } from "@/features/alien-expansion";
// 新規追加
import { debugConsoleFeature } from "@/features/debug-console";

/**
 * アプリケーションで有効化するFeatureのリスト
 * ここに登録された順序で初期化・レンダリングが行われる
 */
export const FeaturesRegistry: GameFeature[] = [
  // システム・基盤系
  fieldGridFeature,
  turnSystemFeature,

  // ゲームプレイルール系
  alienGrowthFeature,
  alienExpansionFeature,
  playCardFeature,

  // UI・操作系
  cardHandFeature,
  hudFeature,

  // デバッグ機能 (必要に応じてコメントアウト可能)
  debugConsoleFeature,
];