// vite/src/features/card-hand/hooks/useCardLogic.ts
import { useMemo, useState, useEffect } from "react";
import { useGameQuery } from "@/core/api/queries";
import type { CardDefinition, PlayerType } from "@/shared/types";
import { CardColors } from "../domain/CardLayout";

type UseCardLogicProps = {
	card: CardDefinition & { instanceId: string };
	player: PlayerType;
};

export type UseCardLogicResult = {
	state: {
		isHovered: boolean;
		isSelected: boolean;
		isPlayable: boolean;
		isCooldown: boolean;
		isMyTurn: boolean;
	};
	data: {
		textureUrl: string;
		headerColor: string;
		borderStateColor: string;
		cooldownRounds?: number;
	};
	handlers: {
		setIsHovered: (isHovered: boolean) => void;
	};
};

export const useCardLogic = ({ card, player }: UseCardLogicProps): UseCardLogicResult => {
	const [isHovered, setIsHovered] = useState(false);
	const [textureUrl, setTextureUrl] = useState<string>("https://placehold.co/256x160/ccc/999?text=Loading");

	const selectedCardId = useGameQuery.ui.useSelectedCardId();
	const activePlayerId = useGameQuery.useActivePlayer();
	const playerState = useGameQuery.usePlayer(player);

	// クールダウン情報の取得
	const cooldownInfo = playerState?.cooldownActiveCards.find((c) => c.cardId === card.instanceId);
	const isCooldown = !!cooldownInfo;
	const isSelected = selectedCardId === card.instanceId;
	const isMyTurn = activePlayerId === player;
	const isPlayable = isMyTurn && !isCooldown;

	useEffect(() => {
		const img = new Image();
		img.crossOrigin = "Anonymous";
		img.src = card.imagePath;
		img.onload = () => setTextureUrl(card.imagePath);
	}, [card.imagePath]);

	const headerColor = useMemo(() => {
		switch (card.cardType) {
			case "alien": return CardColors.CARD_TYPES.ALIEN;
			case "eradication": return CardColors.CARD_TYPES.ERADICATION;
			case "recovery": return CardColors.CARD_TYPES.RECOVERY;
			default: return CardColors.CARD_TYPES.DEFAULT;
		}
	}, [card.cardType]);

	const borderStateColor = isSelected
		? CardColors.CARD_UI.BORDER_SELECTED
		: isHovered
			? CardColors.CARD_UI.BORDER_HOVER
			: CardColors.CARD_UI.BORDER_DEFAULT;

	return {
		state: { isHovered, isSelected, isPlayable, isCooldown, isMyTurn },
		data: {
			textureUrl,
			headerColor,
			borderStateColor,
			cooldownRounds: cooldownInfo?.roundsRemaining,
		},
		handlers: {
			setIsHovered,
		},
	};
};