// vite/src/core/api/utils.ts

import { FieldSystem } from "../systems/FieldSystem";

/**
 * Feature向けに公開する計算・ユーティリティ関数群
 * Coreの内部システム(System)への直接依存を防ぐためのFacade
 */
export const FieldUtils = {
	/** 指定座標のセル情報を取得する */
	getCell: FieldSystem.getCell,

	/** セル情報を更新した新しいフィールドを返す (Immutability Helper) */
	updateCell: FieldSystem.updateCell,

	/** 複数のセル情報を一括更新した新しいフィールドを返す */
	updateCells: FieldSystem.updateCells,

	/** フィールド生成 (初期化用) */
	initializeField: FieldSystem.initializeField,
};