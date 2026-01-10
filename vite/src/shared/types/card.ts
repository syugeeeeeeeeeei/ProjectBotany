/**
 * src/shared/types/card.ts
 * カードデータの構造定義
 */

import {
	GridShape,
	CounterAbility,
	EradicationType,
	ProtectionType,
	CellType
} from "./primitives";

// 効果範囲の定義
export interface CardRange {
	/** 効果形状 */
	shape: GridShape;
	/** 効果規模（拡散力/駆除範囲/回復範囲の半径や距離） */
	scale: number;
}

// 状態遷移の定義
export interface StateTransition {
	/** 効果対象となるマスの種類（配列の場合はいずれかにマッチすれば対象） */
	target: CellType | CellType[];
	/** 効果発動後のマスの種類 */
	result: CellType;
}

/**
 * カード定義の基底インターフェース
 * 全てのカードタイプで共通のプロパティ
 */
export interface CardBase {
	id: string;
	name: string;
	description: string; // フレーバーテキスト兼説明
	cost: number;        // 必要AP
	deckCount: number;   // デッキに含まれる枚数
	imagePath: string;

	// --- 共通化されたパラメータ ---
	/** 効果範囲設定 */
	range: CardRange;

	/** * ✨ 変更: 状態遷移設定
	 * 複数の遷移ルールを定義可能にするため配列化
	 * 例: [{ target: 'bare', result: 'pioneer' }, { target: 'pioneer', result: 'native' }]
	 */
	transition: StateTransition[];

	// --- 使用制限 (Usage Restrictions) ---
	usageLimit?: number;    // 使用回数制限 (undefinedなら無制限)
	cooldownTurns?: number; // クールタイム (0またはundefinedならなし)
}

/**
 * 外来種カード定義
 */
export interface AlienCardDefinition extends CardBase {
	cardType: "alien";
	/** 反撃特性: 物理駆除された時の挙動 */
	counterAbility: CounterAbility;
}

/**
 * 駆除カード定義
 */
export interface EradicationCardDefinition extends CardBase {
	cardType: "eradication";
	/** 駆除タイプ: 簡易(反撃あり) vs 完全(反撃なし) vs 連鎖 */
	eradicationType: EradicationType;
	/** 反撃無効: trueなら簡易駆除でも反撃を防ぐ (Optional) */
	preventsCounter?: boolean;
}

/**
 * 回復カード定義
 */
export interface RecoveryCardDefinition extends CardBase {
	cardType: "recovery";
	/** 防御効果 */
	protection: ProtectionType;
}

/**
 * 統合カード型
 */
export type CardDefinition =
	| AlienCardDefinition
	| EradicationCardDefinition
	| RecoveryCardDefinition;