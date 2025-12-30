// src/app/features.ts
import { GameFeature } from "@/core/types/architecture";
import { fieldGridFeature } from "@/features/field-grid";
import { turnSystemFeature } from "@/features/turn-system";
import { alienExpansionFeature } from "@/features/alien-expansion";
// 新機能はここに追加するだけ
// import { weatherFeature } from "@/features/weather";

export const FeaturesRegistry: GameFeature[] = [
  fieldGridFeature,
  turnSystemFeature,
  alienExpansionFeature,
  // weatherFeature,
];
