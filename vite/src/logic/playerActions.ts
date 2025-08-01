import { MAX_ENVIRONMENT } from "../constants/game";
import type { CardDefinition, PlayerState } from "../types/data";

/**
 * カードをプレイした後のプレイヤーの状態を更新します。
 */
export const updatePlayerStateAfterPlayingCard = (
	playerState: PlayerState,
	cardDef: CardDefinition
): PlayerState => {
	// ✨ クールタイムが設定されていればリストに追加
	const newCooldownCards = [...playerState.cooldownActiveCards];
	if (cardDef.cooldownTurns) {
		newCooldownCards.push({
			cardId: cardDef.id,
			turnsRemaining: cardDef.cooldownTurns,
		});
	}

	// ✨ 手札や捨て札の操作をなくし、コスト消費とクールダウン設定のみに
	return {
		...playerState,
		currentEnvironment: playerState.currentEnvironment - cardDef.cost,
		cooldownActiveCards: newCooldownCards,
	};
};

/**
 * 新しいターン開始時にプレイヤーのリソースとクールダウンを更新します。
 */
export const updatePlayerResourcesForNewTurn = (
	playerState: PlayerState,
	nextTurn: number
): PlayerState => {
	const updatedCooldownCards = playerState.cooldownActiveCards
		.map((card) => ({
			...card,
			turnsRemaining: card.turnsRemaining - 1,
		}))
		.filter((card) => card.turnsRemaining > 0);

	return {
		...playerState,
		currentEnvironment: Math.min(nextTurn, MAX_ENVIRONMENT),
		cooldownActiveCards: updatedCooldownCards,
	};
};

// ✨ drawCard関数は不要になったため削除