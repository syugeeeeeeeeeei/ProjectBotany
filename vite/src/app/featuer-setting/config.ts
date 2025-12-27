/**
 * 🌿 Project Botany 論理機能フラグ設定
 * * 機能のパージ（無効化）やマージ（有効化）をここで一括管理します。
 * コードが物理的に存在していても、ここで false になれば
 * ロジック、UIスロット、イベントハンドリングのすべてがシステムから切り離されます。
 */
export const ENABLED_FEATURES = {
	"play-card": true,
	"move-alien": true,
	"turn-system": true,
	"hud": true,
	"card-hand": true,
} as const;

export type FeatureKey = keyof typeof ENABLED_FEATURES;