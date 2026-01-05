/**
 * src/shared/types/card.ts
 * カードデータの構造定義
 */

import {
	GridShape,
	CounterAbility,
	EradicationType,
	PostRemovalState,
	ProtectionType
} from "./primitives";

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

	// --- 使用制限 (Usage Restrictions) ---
	usageLimit?: number;    // 使用回数制限 (undefinedなら無制限)
	cooldownTurns?: number; // クールタイム (0またはundefinedならなし)
}

/**
 * 外来種カード定義
 */
export interface AlienCardDefinition extends CardBase {
	cardType: "alien";
	/** 拡散力 (1~3): 成体時の侵略距離 */
	expansionPower: number;
	/** 拡散形状: 成体時の侵略パターン */
	expansionRange: GridShape;
	/** 反撃特性: 物理駆除された時の挙動 */
	counterAbility: CounterAbility;
}

/**
 * 駆除カード定義
 */
export interface EradicationCardDefinition extends CardBase {
	cardType: "eradication";
	/** 駆除力: (将来的な拡張用) */
	eradicationPower: number;
	/** 駆除範囲 */
	eradicationRange: GridShape;
	/** 駆除タイプ: 物理(反撃あり) vs 完全(反撃なし) */
	eradicationType: EradicationType;
	/** 連鎖駆除: 支配下の赤マスもまとめて消すか */
	chainDestruction: boolean;
	/** 駆除後の土地状態 */
	postState: PostRemovalState;
}

/**
 * 回復カード定義
 */
export interface RecoveryCardDefinition extends CardBase {
	cardType: "recovery";
	/** 回復力: 1=裸地->先駆, 2=裸地->在来, 3=先駆->在来 */
	recoveryPower: number;
	/** 回復範囲 */
	recoveryRange: GridShape;
	/** 防御効果 */
	protection: ProtectionType;
}

/**
 * 統合カード型
 * 判別共用体 (Discriminated Union) として使用
 */
export type CardDefinition =
	| AlienCardDefinition
	| EradicationCardDefinition
	| RecoveryCardDefinition;