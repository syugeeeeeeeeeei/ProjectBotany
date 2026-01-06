// vite/src/app/FeaturesRegistry.ts

import { GameFeature } from "@/core/types/architecture";
import { fieldGridFeature } from "@/features/field-grid";
import { turnSystemFeature } from "@/features/turn-system";
import { cardHandFeature } from "@/features/card-hand";
import { playCardFeature } from "@/features/play-card";
import { alienExpansionFeature } from "@/features/alien-expansion";
import { alienGrowthFeature } from "@/features/alien-growth";
import { hudFeature } from "@/features/hud";

export const FeaturesRegistry: GameFeature[] = [
  fieldGridFeature,
  hudFeature,
  turnSystemFeature,
  cardHandFeature,
  playCardFeature,

  // ▼ 実行順序が重要: Expansion(拡散) -> Growth(成長)
  // Expansion: 成体が周囲を塗る
  // Growth: 種が成体になる (このターン生まれた種はまだ拡散しないため、Expansionより後に実行)
  alienExpansionFeature,
  alienGrowthFeature,
];