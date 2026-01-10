import { useMemo, useEffect } from "react";
import { useGameQuery } from "@/core/api/queries";
import { useUIStore } from "@/core/store/uiStore";
import { cardMasterData } from "@/shared/data/cardMasterData";
import { getCellsByShape } from "@/features/Card/PlayCard/logic";
import { Point } from "@/shared/types/primitives";
import { CardDefinition, FieldState, CellType } from "@/shared/types";
import { DESIGN } from "@/shared/constants/design-tokens";
import { FieldUtils } from "@/core/api/utils";

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

		if (playerState) {
			const handCard = playerState.cardLibrary.find(
				(c) => c.instanceId === selectedCardId
			);
			if (handCard) {
				return cardMasterData.find((c) => c.id === handCard.cardDefinitionId) ?? null;
			}
		}
		const directMaster = cardMasterData.find(c => c.id === selectedCardId);
		if (directMaster) return directMaster;

		return null;
	}, [selectedCardId, playerState]);

	useEffect(() => {
		if (selectedCardId && !selectedCard) {
			console.warn(`[PlacementGuide] Card ID '${selectedCardId}' not found.`);
		}
	}, [selectedCardId, selectedCard]);

	// ヘルパー: 配置可否判定
	const checkPlacementValid = (x: number, y: number, card: CardDefinition, fieldData: FieldState): boolean => {
		const cell = fieldData.cells[y]?.[x];
		if (!cell) return false;

		// ✨ 修正: 配列内のいずれかのターゲットにマッチするかチェック
		const allowedTargets: CellType[] = [];
		card.transition.forEach(t => {
			const targets = Array.isArray(t.target) ? t.target : [t.target];
			allowedTargets.push(...targets);
		});

		return allowedTargets.includes(cell.type);
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

		// 連鎖駆除 (Chain) の特別ハイライト
		if (selectedCard.cardType === "eradication" && selectedCard.eradicationType === "chain") {
			const cell = FieldUtils.getCell(field, hoveredCell);
			// Coreにホバーしている場合のみ、その一族全体をハイライト
			if (cell && cell.type === "alien-core" && cell.alienUnitId) {
				const linkedCells = [
					...FieldUtils.getCellsByType(field, "alien"),
					...FieldUtils.getCellsByType(field, "alien-core")
				].filter(p => {
					const c = FieldUtils.getCell(field, p);
					return c?.alienUnitId === cell.alienUnitId;
				});
				return linkedCells;
			}
		}

		// 通常の範囲計算
		const { shape, scale } = selectedCard.range;

		return getCellsByShape(
			field.width,
			field.height,
			{ x: hoveredCell.x, y: hoveredCell.y },
			shape,
			scale
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