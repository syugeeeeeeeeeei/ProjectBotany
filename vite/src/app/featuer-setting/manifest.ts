import { FeatureKey } from "./config";

/**
 * 🌿 機能マニフェスト
 * * 各機能の識別子（FeatureKey）と、その初期化処理を紐付けます。
 * 非同期インポートを使用することで、無効な機能のコードはブラウザに読み込まれません。
 */
export const FEATURE_MANIFEST: Record<FeatureKey, () => Promise<void>> = {
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
		// HUDは現状UIのみのため初期化なし
	},
	"card-hand": async () => {
		// 手札は現状UIのみのため初期化なし
	},
};