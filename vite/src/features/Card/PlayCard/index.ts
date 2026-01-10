// vite/src/features/play-card/index.ts
import { GameFeature } from "@/core/types/architecture";
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { useGameStore } from "@/core/store/gameStore";
import { useUIStore } from "@/core/store/uiStore";
import { gameActions } from "@/core/api/actions";
import { cardMasterData } from "@/shared/data/cardMasterData";
import { executeCardEffect } from "./logic";

export const playCardFeature: GameFeature = {
  key: "play-card",

  init: () => {
    /**
     * 盤面のマスがクリックされた際の処理
     */
    const handleCellClick = ({ cell }: { cell: { x: number; y: number } }) => {
      const uiState = useUIStore.getState();
      const selectedCardId = uiState.selectedCardId;

      if (!selectedCardId) return;

      const gameState = useGameStore.getState();
      const activePlayerId = gameState.activePlayerId;
      const playerState = gameState.playerStates[activePlayerId];

      const cardInstance = playerState.cardLibrary.find(
        (c) => c.instanceId === selectedCardId
      );
      if (!cardInstance) return;

      const cardDef = cardMasterData.find(
        (c) => c.id === cardInstance.cardDefinitionId
      );
      if (!cardDef) return;

      // 1. コスト（AP）不足チェック
      if (playerState.currentEnvironment < cardDef.cost) {
        console.warn(`[PlayCard] Not enough AP. Required: ${cardDef.cost}, Current: ${playerState.currentEnvironment}`);
        gameActions.ui.notify({ message: "APが不足しています" });
        return;
      }

      // 2. クールダウンチェック (念のためここでも確認)
      const isCooldown = playerState.cooldownActiveCards.some(
        (c) => c.cardId === selectedCardId
      );
      if (isCooldown) {
        console.warn(`[PlayCard] Card is on cooldown.`);
        gameActions.ui.notify({ message: "クールダウン中です" });
        return;
      }

      // 3. 効果の実行
      const nextState = executeCardEffect(gameState, cardDef, { x: cell.x, y: cell.y });

      // 4. 成功時の状態更新
      if (nextState !== gameState) {
        // クールダウン設定 (定義に設定があれば)
        const newCooldowns = [...playerState.cooldownActiveCards];
        if (cardDef.cooldownTurns && cardDef.cooldownTurns > 0) {
          newCooldowns.push({
            cardId: selectedCardId,
            roundsRemaining: cardDef.cooldownTurns,
          });
        }

        // ✨ 修正: 使用回数制限の更新
        const newLimitedCardsUsedCount = { ...playerState.limitedCardsUsedCount };
        if (cardDef.usageLimit !== undefined) {
          const currentCount = newLimitedCardsUsedCount[cardDef.id] || 0;
          newLimitedCardsUsedCount[cardDef.id] = currentCount + 1;
        }

        const updatedPlayerState = {
          ...nextState.playerStates[activePlayerId],
          // AP消費
          currentEnvironment: playerState.currentEnvironment - cardDef.cost,
          // 修正: カードは消費しないため cardLibrary はフィルタリングしない
          cardLibrary: playerState.cardLibrary,
          // クールダウン適用
          cooldownActiveCards: newCooldowns,
          // ✨ 使用回数更新を適用
          limitedCardsUsedCount: newLimitedCardsUsedCount,
        };

        const finalState = {
          ...nextState,
          playerStates: {
            ...nextState.playerStates,
            [activePlayerId]: updatedPlayerState
          }
        };

        gameActions.system.updateState(finalState);
        gameActions.ui.deselectCard();
        console.info(`[PlayCard] Played ${cardDef.name}. AP consumed: ${cardDef.cost}`);
      }
    };

    gameEventBus.on("CELL_CLICK", handleCellClick);
    return () => {
      gameEventBus.off("CELL_CLICK", handleCellClick);
    };
  },

  renderUI: () => null,
};