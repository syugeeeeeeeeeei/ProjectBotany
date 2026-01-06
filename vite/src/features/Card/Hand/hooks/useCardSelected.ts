// vite/src/features/card-hand/hooks/useCardSelected.ts
import { useCallback } from "react";
import { useGameQuery } from "@/core/api/queries";
import { gameActions } from "@/core/api/actions";

/**
 * カードの選択状態を管理するフック
 */
export const useCardSelected = () => {
	const selectedCardId = useGameQuery.ui.useSelectedCardId();

	const select = useCallback((instanceId: string) => {
		console.log(`[CardSelect] card: ${instanceId}`);
		gameActions.ui.selectCard(instanceId);
	}, []);

	const deselect = useCallback(() => {
		console.log(`[CardDeselect] card: ${selectedCardId}`);
		gameActions.ui.deselectCard();
	}, []);

	return {
		selectedCardId,
		isAnySelected: !!selectedCardId,
		actions: {
			select,
			deselect,
		},
	};
};