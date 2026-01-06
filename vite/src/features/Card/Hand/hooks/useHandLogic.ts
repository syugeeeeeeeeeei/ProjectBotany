// vite/src/features/card-hand/hooks/useHandLogic.ts
import { useState, useMemo, useCallback, useEffect } from "react";
import { useSpring } from "@react-spring/three";
import { useGameQuery } from "@/core/api/queries";
import { gameActions } from "@/core/api/actions";
import type { PlayerType, CardDefinition } from "@/shared/types";
import { cardMasterData } from "@/shared/data/cardMasterData";
import { HandLayout } from "../domain/HandLayout";
import { useToggleHand } from "./useToggleHand";
import { useCardSelected } from "./useCardSelected";

type CardWithInstanceId = CardDefinition & { instanceId: string };

export const useHandLogic = (player: PlayerType) => {
	const playerState = useGameQuery.usePlayer(player);
	const activePlayerId = useGameQuery.useActivePlayer();
	const isInteractionLocked = useGameQuery.ui.useIsInteractionLocked();

	const [currentPage, setCurrentPage] = useState(0);

	const facingFactor = playerState?.facingFactor ?? 1;
	const isMyTurn = activePlayerId === player;

	const { selectedCardId, isAnySelected, actions: selectionActions } = useCardSelected();

	// ターン終了時に解除
	useEffect(() => {
		if (!isMyTurn && isAnySelected) {
			selectionActions.deselect();
		}
	}, [isMyTurn, isAnySelected, selectionActions]);

	const { state: toggleState, animation: toggleAnim, actions: toggleActions } = useToggleHand(isMyTurn, isAnySelected);

	const cards = useMemo(() => {
		const definitions = playerState?.cardLibrary ?? [];
		return definitions
			.map((c) => {
				const def = cardMasterData.find((m) => m.id === c.cardDefinitionId);
				if (!def) return null;
				return { ...def, instanceId: c.instanceId } as CardWithInstanceId;
			})
			.filter(Boolean) as CardWithInstanceId[];
	}, [playerState?.cardLibrary]);

	const maxPage = Math.max(0, Math.ceil(cards.length / HandLayout.CARDS_PER_PAGE) - 1);
	const pageWidth = HandLayout.PAGE_WIDTH;

	const { xPos } = useSpring({
		xPos: -currentPage * (pageWidth + HandLayout.PAGE_GAP_X),
		config: HandLayout.ANIMATION.SPRING_CONFIG,
	});

	const handlers = {
		onSwipeUp: useCallback(() => toggleActions.show(), [toggleActions]),
		onSwipeDown: useCallback(() => toggleActions.hide(), [toggleActions]),
		onSwipeLeft: useCallback(() => setCurrentPage((p) => Math.min(maxPage, p + 1)), [maxPage]),
		onSwipeRight: useCallback(() => setCurrentPage((p) => Math.max(0, p - 1)), []),
		onAreaClick: useCallback(() => isAnySelected && selectionActions.deselect(), [isAnySelected, selectionActions]),

		// バリデーション付きの選択処理
		onCardSelect: useCallback((card: CardWithInstanceId) => {
			if (isInteractionLocked) return;
			if (!isMyTurn) {
				gameActions.ui.notify({ message: "相手のターンです", player });
				return;
			}
			const isCooldown = playerState?.cooldownActiveCards.some(c => c.cardId === card.instanceId);
			if (isCooldown) {
				gameActions.ui.notify({ message: "クールダウン中です", player });
				return;
			}
			selectionActions.select(card.instanceId);
		}, [isInteractionLocked, isMyTurn, playerState, player, selectionActions]),

		onCardDeselect: useCallback(() => selectionActions.deselect(), [selectionActions]),
	};

	return {
		state: { cards, isVisible: toggleState.isVisible, effectiveIsVisible: toggleState.effectiveIsVisible, isAnySelected, selectedCardId, isInteractionLocked, isMyTurn },
		layout: { facingFactor, zPos: toggleAnim.zPos, xPos, pageWidth },
		handlers,
	};
};