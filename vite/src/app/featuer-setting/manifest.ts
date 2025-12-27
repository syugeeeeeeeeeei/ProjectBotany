import { FeatureKey } from "./config";

/**
 * 🌿 機能マニフェスト
 * 
 * 【動機】
 * 各機能の物理的な実装（ファイル）と論理的な識別子（FeatureKey）を紐付け、
 * 実行時に動的に初期化を行うための辞書を定義します。
 * TypeScript の型システムを活用し、存在する機能に対してのみ初期化処理を定義することを保証します。
 *
 * 【恩恵】
 * - ダイナミックインポート（`import()`）を利用することで、不要な機能のコードがチャンクとして読み込まれず、
 *   初期ロードのパフォーマンスが向上します（コード分割）。
 * - 機能の追加や削除が、このマニフェストへの追記・削除という明確な形で管理できます。
 *
 * 【使用法】
 * `FEATURE_MANIFEST` に `FeatureKey` をキー、非同期の初期化関数を値として登録します。
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