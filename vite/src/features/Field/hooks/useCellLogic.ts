import { useRef, useEffect, useMemo, useCallback } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { useUIStore } from "@/core/store/uiStore";
import { useGameQuery, gameActions } from "@/core/api";
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { CellState } from "@/shared/types/game-schema";
import { cardMasterData } from "@/shared/data/cardMasterData";
import { DESIGN } from "@/shared/constants/design-tokens";

// 最低ホバー時間
const HOVER_THRESHOLD = 0;

export const useCellLogic = (cell: CellState) => {
	const isSelected = useUIStore(
		(s) => s.selectedCell?.x === cell.x && s.selectedCell?.y === cell.y
	);
	const isHovered = useUIStore(
		(s) => s.hoveredCell?.x === cell.x && s.hoveredCell?.y === cell.y
	);

	const selectedCardId = useUIStore((s) => s.selectedCardId);
	const activePlayerId = useGameQuery.useActivePlayer();
	const playerState = useGameQuery.usePlayer(activePlayerId);

	// タイマー管理用のRef
	const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

	// 選択中のカード情報を取得
	const selectedCardDef = useMemo(() => {
		if (!selectedCardId || !playerState) return null;
		const handCard = playerState.cardLibrary.find(
			(c) => c.instanceId === selectedCardId
		);
		if (handCard) {
			return cardMasterData.find((c) => c.id === handCard.cardDefinitionId);
		}
		return cardMasterData.find((c) => c.id === selectedCardId);
	}, [selectedCardId, playerState]);

	// クリーンアップ: アンマウント時にタイマー解除
	useEffect(() => {
		return () => {
			if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
		};
	}, []);

	// --- Styles ---
	const cellColor = useMemo(() => {
		switch (cell.type) {
			case "native":
				return DESIGN.COLORS.NATIVE_AREA;
			case "alien":
				return DESIGN.COLORS.ALIEN_INVASION;
			case "pioneer":
				return DESIGN.COLORS.RECOVERY_PENDING;
			case "bare":
				return DESIGN.COLORS.EMPTY;
			default:
				return DESIGN.COLORS.DEFAULT_CELL;
		}
	}, [cell.type]);

	const emissiveColor = useMemo(() => {
		if (isSelected) return "#ffffff";
		if (isHovered) return "#666666";
		return DESIGN.COLORS.EMISSIVE_DEFAULT;
	}, [isSelected, isHovered]);

	const emissiveIntensity = isSelected || isHovered ? 0.5 : 0;

	// --- Event Handlers ---

	const handlePointerOver = useCallback(
		(e: ThreeEvent<MouseEvent>) => {
			e.stopPropagation();

			// Store更新
			useUIStore.getState().hoverCell(cell);
			useUIStore.getState().setHoverValid(false);

			// カード選択中ならタイマー開始
			if (selectedCardId) {
				if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

				hoverTimerRef.current = setTimeout(() => {
					useUIStore.getState().setHoverValid(true);
				}, HOVER_THRESHOLD);
			}
		},
		[cell, selectedCardId]
	);

	const handlePointerOut = useCallback(() => {
		if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
		useUIStore.getState().hoverCell(null);
		useUIStore.getState().setHoverValid(false);
	}, []);

	/**
	 * クリック時の処理 (onPointerUp / onClick)
	 */
	const handleClick = useCallback(
		(e: ThreeEvent<MouseEvent>) => {
			e.stopPropagation();

			// カード未選択時の処理
			if (!selectedCardId) {
				// ✨ 修正: カード未選択時にマスをタップしても「選択状態（青白ハイライト）」にはしない。
				// 既存の選択があれば解除するだけに留める。
				useUIStore.getState().selectCell(null);
				return;
			}

			// 誤タップ防止: 1秒未満のホバーなら無視 (isHoverValid)
			// ※ モバイル等での即時タップに対応する場合はここを調整するが、
			//   現在はホバー必須の仕様としている。
			if (!useUIStore.getState().isHoverValid) {
				return;
			}

			// バリデーション
			if (selectedCardDef) {
				let isValid = true;
				let errorMsg = "";

				if (selectedCardDef.cardType === "alien") {
					if (cell.type !== "bare") {
						isValid = false;
						errorMsg = "外来種は「裸地」にしか配置できません";
					}
				}

				if (!isValid) {
					gameActions.ui.notify({
						message: errorMsg,
						type: "error",
					});
					return;
				}
			}

			// 配置実行
			gameEventBus.emit("CELL_CLICK", { cell });

			// 実行後はタイマーリセット
			if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
			useUIStore.getState().setHoverValid(false);
		},
		[cell, selectedCardId, selectedCardDef]
	);

	return {
		isSelected,
		isHovered,
		styles: {
			cellColor,
			emissiveColor,
			emissiveIntensity,
		},
		handlers: {
			handlePointerOver,
			handlePointerOut,
			handleClick,
		},
	};
};