import { useMemo, useState, useEffect } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useGameQuery } from "@/core/api/queries";
import { gameActions } from "@/core/api/actions";
import type { CardDefinition, PlayerType } from "@/shared/types/game-schema";
import { CardColors } from "../domain/cardLayout";

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
	};
	data: {
		textureUrl: string;
		headerColor: string;
		borderStateColor: string;
		cooldownTurns?: number;
	};
	handlers: {
		onClick: (e: ThreeEvent<MouseEvent>) => void;
		onPointerEnter: (e: ThreeEvent<PointerEvent>) => void;
		onPointerLeave: (e: ThreeEvent<PointerEvent>) => void;
	};
};

export const useCardLogic = ({
	card,
	player,
}: UseCardLogicProps): UseCardLogicResult => {
	const [isHovered, setIsHovered] = useState(false);
	const [textureUrl, setTextureUrl] = useState<string>(
		"https://placehold.co/256x160/ccc/999?text=Loading",
	);

	// Core API経由でデータを取得
	const selectedCardId = useGameQuery.ui.useSelectedCardId();
	const activePlayerId = useGameQuery.useActivePlayer();
	const playerState = useGameQuery.usePlayer(player);

	// 状態判定
	const cooldownInfo = playerState?.cooldownActiveCards.find(
		(c) => c.cardId === card.instanceId,
	);
	const isCooldown = !!cooldownInfo;
	const isSelected = selectedCardId === card.instanceId;
	const isMyTurn = activePlayerId === player;
	const isPlayable = isMyTurn && !isCooldown;

	// テクスチャ読み込み
	useEffect(() => {
		const img = new Image();
		img.crossOrigin = "Anonymous";
		img.src = card.imagePath;
		img.onload = () => setTextureUrl(card.imagePath);
	}, [card.imagePath]);

	// イベントハンドラ (Store直接操作禁止 → Action経由)
	const handleClick = (e: ThreeEvent<MouseEvent>) => {
		e.stopPropagation();

		if (!isMyTurn) {
			gameActions.ui.notify("相手のターンです", player);
			return;
		}
		if (isCooldown) {
			gameActions.ui.notify(
				`このカードはあと${cooldownInfo?.turnsRemaining}ターン使用できません。`,
				player,
			);
			return;
		}

		if (isSelected) {
			gameActions.ui.deselectCard();
		} else {
			gameActions.ui.selectCard(card.instanceId);
		}
	};

	const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
		e.stopPropagation();
		if (isPlayable) setIsHovered(true);
	};

	const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
		e.stopPropagation();
		setIsHovered(false);
	};

	// 表示色の計算
	const headerColor = useMemo(() => {
		switch (card.cardType) {
			case "alien":
				return CardColors.CARD_TYPES.ALIEN;
			case "eradication":
				return CardColors.CARD_TYPES.ERADICATION;
			case "recovery":
				return CardColors.CARD_TYPES.RECOVERY;
			default:
				return CardColors.CARD_TYPES.DEFAULT;
		}
	}, [card.cardType]);

	const borderStateColor = isSelected
		? CardColors.CARD_UI.BORDER_SELECTED
		: isHovered
			? CardColors.CARD_UI.BORDER_HOVER
			: CardColors.CARD_UI.BORDER_DEFAULT;

	return {
		state: { isHovered, isSelected, isPlayable, isCooldown },
		data: {
			textureUrl,
			headerColor,
			borderStateColor,
			cooldownTurns: cooldownInfo?.turnsRemaining,
		},
		handlers: {
			onClick: handleClick,
			onPointerEnter: handlePointerEnter,
			onPointerLeave: handlePointerLeave,
		},
	};
};
