// vite/src/app/FeaturesRegistry.ts
import { GameFeature } from "@/core/types/architecture";
import { fieldGridFeature } from "@/features/field-grid";
import { turnSystemFeature } from "@/features/turn-system";
import { cardHandFeature } from "@/features/card-hand";
import { playCardFeature } from "@/features/play-card";
import { alienExpansionFeature } from "@/features/alien-expansion";
import { alienGrowthFeature } from "@/features/alien-growth";
import { hudFeature } from "@/features/hud"; // 追加

export const FeaturesRegistry: GameFeature[] = [
  fieldGridFeature,
  hudFeature, // 追加 (HUDを表示)
  turnSystemFeature,
  cardHandFeature,
  playCardFeature,
  alienGrowthFeature,
  alienExpansionFeature,
];