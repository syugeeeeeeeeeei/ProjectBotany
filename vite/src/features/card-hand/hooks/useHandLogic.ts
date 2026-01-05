// src/features/card-hand/hooks/useHandLogic.ts
import { useState, useMemo } from "react";
import { useSpring } from "@react-spring/three";
import { useGesture } from "@use-gesture/react";
import { useGameQuery } from "@/core/api/queries";
import { gameActions } from "@/core/api/actions";
import type { PlayerType, CardDefinition } from "@/shared/types";
import cardMasterData from "@/shared/data/cardMasterData";
import { HandLayout } from "../domain/HandLayout"; // 修正: 分離したファイルからインポート

type CardWithInstanceId = CardDefinition & { instanceId: string };

export const useHandLogic = (player: PlayerType) => {
	const playerState = useGameQuery.usePlayer(player);
	const activePlayerId = useGameQuery.useActivePlayer();

	const selectedCardId = useGameQuery.ui.useSelectedCardId();
	const isInteractionLocked = useGameQuery.ui.useIsInteractionLocked();

	const [currentPage, setCurrentPage] = useState(0);
	const [isVisible, setIsVisible] = useState(true);

	const facingFactor = playerState?.facingFactor ?? 1;
	const isMyTurn = activePlayerId === player;

	const effectiveIsVisible = isMyTurn && isVisible;

	const cards = useMemo(() => {
		if (!playerState) return [];
		return playerState.cardLibrary
			.map((inst) => {
				const def = cardMasterData.find((c) => c.id === inst.cardDefinitionId);
				return def ? { ...def, instanceId: inst.instanceId } : null;
			})
			.filter((c): c is CardWithInstanceId => c !== null);
	}, [playerState]);

	const isMyCardSelected = useMemo(() => {
		if (!selectedCardId) return false;
		return cards.some((c) => c.instanceId === selectedCardId);
	}, [cards, selectedCardId]);

	const maxPage = Math.max(
		0,
		Math.ceil(cards.length / HandLayout.CARDS_PER_PAGE) - 1,
	);

	const pageWidth = HandLayout.PAGE_WIDTH;

	const { xPos } = useSpring({
		xPos: -currentPage * (pageWidth + HandLayout.PAGE_GAP_X) * facingFactor,
		config: HandLayout.ANIMATION.SPRING_CONFIG,
	});

	const { zPos } = useSpring({
		zPos: effectiveIsVisible
			? HandLayout.POSITION.Z.VISIBLE
			: HandLayout.POSITION.Z.HIDDEN,
		config: HandLayout.ANIMATION.SPRING_CONFIG,
	});

	const bindGesture = useGesture(
		{
			onDrag: ({
				movement: [mx, my],
				velocity: [vx, vy],
				direction: [dx, dy],
				last,
				tap,
				event,
			}) => {
				if (tap || !last) return;
				event.stopPropagation();

				const FLICK_DIST = 45;
				const FLICK_VEL = 0.5;

				if (Math.abs(mx) > Math.abs(my)) {
					if (Math.abs(mx) > FLICK_DIST && Math.abs(vx) > FLICK_VEL) {
						const pageDir = -Math.sign(dx) * facingFactor;
						setCurrentPage((prev) =>
							Math.max(0, Math.min(maxPage, prev + pageDir)),
						);
					}
					return;
				}

				if (Math.abs(my) > FLICK_DIST && Math.abs(vy) > FLICK_VEL * 0.5) {
					const isUp = dy * facingFactor < 0;
					const isDown = dy * facingFactor > 0;

					if (isDown && isVisible) setIsVisible(false);
					else if (isUp && !isVisible) setIsVisible(true);
				}
			},

			onClick: ({ event }) => {
				event.stopPropagation();
				if (effectiveIsVisible && selectedCardId) {
					gameActions.ui.deselectCard();
				}
			},
		},
		{
			enabled: !isInteractionLocked && isMyTurn,
			drag: { filterTaps: true, threshold: 10 },
		},
	);

	return {
		state: {
			cards,
			currentPage,
			effectiveIsVisible,
			isMyCardSelected,
			selectedCardId,
		},
		layout: {
			facingFactor,
			zPos,
			xPos,
			pageWidth,
		},
		bindGesture,
	};
};