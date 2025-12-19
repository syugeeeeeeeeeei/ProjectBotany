import type { CardDefinition } from "../../../shared/types/data";

/**
 * デッキカウント（deckCount）に基づいてカードを複製し、
 * 個別の instanceId を付与したリストを生成する
 */
export const duplicateCardsWithInstanceId = (cards: CardDefinition[]) => {
	return cards.flatMap(card =>
		Array.from({ length: card.deckCount }).map((_, i) => ({
			...card,
			instanceId: `${card.id}-instance-${i}`
		}))
	);
};