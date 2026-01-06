// vite/src/app/FeaturesRegistry.ts
import { GameFeature } from "@/core/types/architecture";
import { fieldGridFeature } from "@/features/field-grid";
import { cardHandFeature } from "@/features/Card/Hand";
import { turnSystemFeature } from "@/features/turn-system";
import { playCardFeature } from "@/features/Card/PlayCard";
import { hudFeature } from "@/features/hud";
import { alienGrowthFeature } from "@/features/Alien/Growth";
import { alienExpansionFeature } from "@/features/Alien/Expansion";
// 新規追加
import { debugConsoleFeature } from "@/features/Debug/Console";

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