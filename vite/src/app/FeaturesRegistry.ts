// vite/src/app/FeaturesRegistry.ts
import { GameFeature } from "@/core/types/architecture";
import { fieldGridFeature } from "@/features/field-grid";
import { cardHandFeature } from "@/features/Card/Hand";
import { playCardFeature } from "@/features/Card/PlayCard";
import { alienGrowthFeature } from "@/features/Alien/Growth";
import { alienExpansionFeature } from "@/features/Alien/Expansion";
import { debugConsoleFeature } from "@/features/Debug/Console";
import { hudFeature } from "@/features/Information/Hud";
import { alertFeature } from "@/features/Information/Alert";
import { bannerFeature } from "@/features/Information/Banner";
import { sceneFeature } from "@/features/Information/Scene";

/**
 * アプリケーションで有効化するFeatureのリスト
 * * 【修正】要件に基づき「成長したターンにエリアが広まる」よう、Growth -> Expansion の順に設定。
 */
export const FeaturesRegistry: GameFeature[] = [
  // システム・基盤系
  fieldGridFeature,

  // ゲームプレイルール系
  alienGrowthFeature,     // 1. まず種が成体に成長
  alienExpansionFeature,  // 2. 成体（およびその支配下のマス）が拡散
  playCardFeature,

  // UI・操作系
  cardHandFeature,
  // Information Features
  hudFeature,
  bannerFeature,
  sceneFeature,
  alertFeature, // アラートは最前面


  // デバッグ機能
  debugConsoleFeature,
];