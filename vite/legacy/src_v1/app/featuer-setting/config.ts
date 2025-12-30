/**
 * 🌿 Project Botany 論理機能フラグ設定
 * * 【動機】
 * アプリケーションの各機能（Feature）を疎結合に保ち、必要に応じて特定の機能を切り離したり（Purge）、
 * 統合したり（Merge）できるプラグインライクなアーキテクチャを実現するためです。
 *
 * 【変更点】
 * - `move-alien` を false に設定 (Phase 1)
 * - `ecosystem-activation` を廃止し、3つの新機能を追加
 * - `alien-expansion` のみ true (Phase 3)
 */
export const ENABLED_FEATURES = {
	"field-grid": true,
	"play-card": true,
	"turn-system": true,
	"hud": true,
	"card-hand": true,

	// --- Configured per plan ---
	"move-alien": false,           // Phase 1: 停止
	"alien-expansion": true,       // Phase 3: 有効（新ロジック）
	"alien-growth": false,         // Phase 2: 停止
	"native-restoration": false,   // Phase 2: 停止
} as const;

export type FeatureKey = keyof typeof ENABLED_FEATURES;