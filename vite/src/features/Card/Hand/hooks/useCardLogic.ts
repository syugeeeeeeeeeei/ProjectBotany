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
		isPlayable: boolean; // ターン中、クールダウンなし、使用回数制限なし
		isCooldown: boolean;
		isMyTurn: boolean;
		isUsable: boolean; // 使用回数が残っているか
	};
	data: {
		textureUrl: string;
		headerColor: string;
		borderStateColor: string;
		cooldownRounds?: number;
		remainingUses?: number;
		hasUsageLimit: boolean;
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

	// ✨ 使用回数情報の取得
	const hasUsageLimit = card.usageLimit !== undefined;
	const usedCount = playerState?.limitedCardsUsedCount?.[card.id] ?? 0;
	const remainingUses = hasUsageLimit ? (card.usageLimit! - usedCount) : undefined;
	const isUsable = hasUsageLimit ? (remainingUses! > 0) : true;

	// プレイ可能判定: 自分のターン && クールダウンでない && 使用可能回数が残っている
	const isPlayable = isMyTurn && !isCooldown && isUsable;

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
		state: { isHovered, isSelected, isPlayable, isCooldown, isMyTurn, isUsable },
		data: {
			textureUrl,
			headerColor,
			borderStateColor,
			cooldownRounds: cooldownInfo?.roundsRemaining,
			remainingUses,
			hasUsageLimit
		},
		handlers: {
			setIsHovered,
		},
	};
};