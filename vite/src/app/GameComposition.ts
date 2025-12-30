import { FieldSystem } from "@/core/systems/FieldSystem";
import { gameActions } from "@/core/api/actions";

/**
 * ゲームの構成・初期化処理 (Composition Root)
 * App起動時に一度だけ実行される
 */
export const initializeGameComposition = () => {
  console.log("🚀 Initializing Core-Feature Architecture...");

  // 1. Core Systems の初期化
  // 盤面のメモリ確保など
  FieldSystem.initializeField();

  // 2. Feature の登録 (Phase 4で実装)
  // 例: registerFeature(alienExpansionFeature);

  // 3. ゲーム開始
  // 必要なら初期ステートのリセットなど
  gameActions.system.reset();

  console.log("✅ Initialization Complete.");
};
