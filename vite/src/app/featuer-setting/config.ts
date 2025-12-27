/**
 * 🌿 Project Botany 論理機能フラグ設定
 * 
 * 【動機】
 * アプリケーションの各機能（Feature）を疎結合に保ち、必要に応じて特定の機能を切り離したり（Purge）、
 * 統合したり（Merge）できるプラグインライクなアーキテクチャを実現するためです。
 * 開発中の未完成な機能が他のシステムに影響を及ぼさないよう制御するガードレールとして機能します。
 *
 * 【恩恵】
 * - 特定の機能を `false` にするだけで、ロジック、UIスロット、イベントハンドリングのすべてを無効化できます。
 * - A/Bテストや、特定のプラットフォーム・環境向けに機能を制限するといった運用が用意になります。
 * - コードベースを整理された状態に保ち、機能間の依存関係を明示的に管理できます。
 *
 * 【使用法】
 * `ENABLED_FEATURES` 内のフラグを書き換えます。
 * システム各所（UIやローダー）は、このフラグを参照して動作や表示を決定します。
 */
export const ENABLED_FEATURES = {
	"play-card": true,
	"move-alien": true,
	"turn-system": true,
	"hud": true,
	"card-hand": true,
} as const;

export type FeatureKey = keyof typeof ENABLED_FEATURES;