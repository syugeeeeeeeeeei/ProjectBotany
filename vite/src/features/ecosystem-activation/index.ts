/**
 * 🌿 Ecosystem Activation Feature (生態系活性化機能)
 * 
 * 【動機】
 * ターン経過に伴う「自然な変化」（外来種の浸食、在来種の再生、植物の成長）を
 * 司るロジックを集約するためです。プレイヤーの直接操作ではなく、
 * システム側が自動的に実行する生態系のシミュレーションロジックを提供します。
 *
 * 【恩恵】
 * - ターン終了後の複雑な盤面更新処理を、ドメインごとに分割して管理できます。
 * - 「外来種が広がる」「空き地が再生を始める」といったゲームの根幹となる動的なルールの実装を隠蔽します。
 *
 * 【使用法】
 * ターン進行ロジック（`turnLogic.ts` 等）から、各フェーズの実行関数を呼び出します。
 */

export * from "./domain/alienExpansion";
export * from "./domain/alienGrowth";
export * from "./domain/nativeRestoration";
