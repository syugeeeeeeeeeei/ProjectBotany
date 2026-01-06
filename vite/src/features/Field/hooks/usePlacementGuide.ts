import { useMemo, useEffect } from "react";
import { useGameQuery } from "@/core/api/queries";
import { useUIStore } from "@/core/store/uiStore";
import { cardMasterData } from "@/shared/data/cardMasterData";
import { getCellsByShape } from "@/features/Card/PlayCard/logic";
import { GridShape, Point } from "@/shared/types/primitives";
import { CardDefinition, FieldState } from "@/shared/types";
import { DESIGN } from "@/shared/constants/design-tokens";

/**
 * ガイド表示に必要なロジックを提供するカスタムフック
 */
export const usePlacementGuide = () => {
	const hoveredCell = useUIStore((s) => s.hoveredCell);
	const selectedCardId = useUIStore((s) => s.selectedCardId);
	const field = useGameQuery.useField();

	const activePlayerId = useGameQuery.useActivePlayer();
	const playerState = useGameQuery.usePlayer(activePlayerId);

	// 1. 選択中のカード定義を特定
	const selectedCard = useMemo<CardDefinition | null>(() => {
		if (!selectedCardId) return null;

		// パターンA: InstanceID から手札を検索
		if (playerState) {
			const handCard = playerState.cardLibrary.find(
				(c) => c.instanceId === selectedCardId
			);
			if (handCard) {
				return cardMasterData.find((c) => c.id === handCard.cardDefinitionId) ?? null;
			}
		}

		// パターンB: DefinitionID が直接指定 (デバッグ用)
		const directMaster = cardMasterData.find(c => c.id === selectedCardId);
		if (directMaster) return directMaster;

		return null;
	}, [selectedCardId, playerState]);

	// デバッグログ
	useEffect(() => {
		if (selectedCardId && !selectedCard) {
			console.warn(`[PlacementGuide] Card ID '${selectedCardId}' not found.`);
		}
	}, [selectedCardId, selectedCard]);

	// ヘルパー: 配置可否判定
	const checkPlacementValid = (x: number, y: number, card: CardDefinition, fieldData: FieldState): boolean => {
		const cell = fieldData.cells[y]?.[x];
		if (!cell) return false;

		if (card.cardType === "alien") {
			// 外来種は「裸地」のみ
			return cell.type === "bare";
		}
		// 駆除・回復は盤面内ならターゲット可能
		return true;
	};

	// 2. 全マスのガイド情報 (配置可能かどうかのマップ)
	const allCellGuides = useMemo(() => {
		if (!selectedCard || !field) return [];

		const guides: { x: number; y: number; isValid: boolean }[] = [];

		for (let y = 0; y < field.height; y++) {
			for (let x = 0; x < field.width; x++) {
				const isValid = checkPlacementValid(x, y, selectedCard, field);
				guides.push({ x, y, isValid });
			}
		}
		return guides;
	}, [selectedCard, field]);

	// 3. ホバー時の効果範囲 (ハイライト用)
	const effectRange = useMemo<Point[]>(() => {
		if (!hoveredCell || !selectedCard || !field) return [];

		let rangeShape: GridShape = "point";

		// カードタイプごとの形状定義
		if (selectedCard.cardType === "alien") {
			// 外来種の場合、配置範囲は1マスだが、
			// 「成体時の効果範囲（拡散範囲）」をハイライトしたい
			rangeShape = selectedCard.expansionRange;
		} else if (selectedCard.cardType === "eradication") {
			rangeShape = selectedCard.eradicationRange;
		} else if (selectedCard.cardType === "recovery") {
			rangeShape = selectedCard.recoveryRange;
		}

		return getCellsByShape(
			field.width,
			field.height,
			{ x: hoveredCell.x, y: hoveredCell.y },
			rangeShape
		);
	}, [hoveredCell, selectedCard, field]);

	// 4. プレビュートークンの表示座標
	const previewPosition = useMemo(() => {
		if (!hoveredCell || !selectedCard) return null;
		return { x: hoveredCell.x, y: hoveredCell.y };
	}, [hoveredCell, selectedCard]);

	// 座標変換ヘルパー
	const getPosition = (x: number, y: number, heightObj = 0.05) => {
		const posX = (x - (7 - 1) / 2) * DESIGN.BOARD.CELL_GAP;
		const posZ = (y - (10 - 1) / 2) * DESIGN.BOARD.CELL_GAP;
		return [posX, heightObj, posZ] as const;
	}

	return {
		allCellGuides,      // 全マスの○×情報
		effectRange,        // ホバー中の効果範囲
		previewPosition,    // プレビュートークンの位置
		selectedCard,       // 選択中のカード情報
		getPosition,
		isVisible: !!(selectedCard && field)
	};
};