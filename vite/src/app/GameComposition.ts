// vite/src/app/GameComposition.ts
import { gameActions } from "@/core/api/actions";

/**
 * ゲームの構成・初期化処理 (Composition Root)
 * App起動時に一度だけ実行される
 */
export const initializeGameComposition = () => {
  console.log("🚀 Initializing Core-Feature Architecture...");

  // 1. システムリセット & ゲーム開始
  // 内部でStoreのリセット、FieldSystem.initField、RoundSystem.startGameが呼ばれる
  gameActions.system.reset();

  console.log("✅ Initialization Complete.");
};