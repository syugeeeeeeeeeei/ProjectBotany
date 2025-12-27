import { FeatureKey } from "./config";

/**
 * 🌿 機能マニフェスト
 * * 【使用法】
 * `FEATURE_MANIFEST` に `FeatureKey` をキー、非同期の初期化関数を値として登録します。
 * 設定で true になっている機能のみ、ここから import が実行されます。
 */
export const FEATURE_MANIFEST: Record<FeatureKey, () => Promise<void>> = {
	"field-grid": async () => {
		const mod = await import("@/features/field-grid");
		mod.initFieldGrid();
	},
	"play-card": async () => {
		const mod = await import("@/features/play-card");
		mod.initPlayCard();
	},
	"move-alien": async () => {
		const mod = await import("@/features/move-alien");
		mod.initMoveAlien();
	},
	"turn-system": async () => {
		const mod = await import("@/features/turn-system");
		mod.initTurnSystem();
	},
	"hud": async () => {
		const mod = await import("@/features/hud");
		mod.initHud();
	},
	"card-hand": async () => {
		const mod = await import("@/features/card-hand");
		mod.initCardHand();
	},

	// --- Ecosystem Features (Splitted) ---
	"alien-expansion": async () => {
		const mod = await import("@/features/alien-expansion");
		mod.initAlienExpansion();
	},
	"alien-growth": async () => {
		const mod = await import("@/features/alien-growth");
		mod.initAlienGrowth();
	},
	"native-restoration": async () => {
		const mod = await import("@/features/native-restoration");
		mod.initNativeRestoration();
	},
};