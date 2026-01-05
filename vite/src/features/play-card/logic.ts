// vite/src/features/play-card/logic.ts
import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { gameQuery, gameActions } from "@/core/api";
import { FieldSystem } from "@/core/systems/FieldSystem";
import cardMasterData from "@/shared/data/cardMasterData";
import { AlienCard } from "@/shared/types/game-schema";
import { generateId } from "@/shared/utils/id";
import { CoreEventMap } from "@/core/types/events";

export const initPlayCardLogic = () => {
  /**
   * ハンドラ1: 盤面クリック時の処理 (インタラクション)
   * カードが選択された状態でマスをクリックしたら、カード使用イベントを発火する
   */
  const handleCellClick = (payload: CoreEventMap["CELL_CLICK"]) => {
    const { cell } = payload;
    const store = gameQuery.state();

    // 選択中のカードインスタンスIDを取得
    const selectedInstanceId = gameQuery.ui.selectedCardId();
    if (!selectedInstanceId) return;

    // アクティブプレイヤーの所持カードから該当インスタンスを探す
    const playerState = store.playerStates[store.activePlayerId];
    const cardInstance = playerState.cardLibrary.find(c => c.instanceId === selectedInstanceId);

    if (!cardInstance) {
      console.warn("Selected card instance not found in player library.");
      return;
    }

    // カード使用イベントを発行 (ロジック本体へ)
    gameEventBus.emit("PLAY_CARD", {
      cardId: cardInstance.cardDefinitionId, // 定義IDを渡す
      targetX: cell.x,
      targetY: cell.y
    });

    // 使用後は選択解除
    gameActions.ui.deselectCard();
  };

  /**
   * ハンドラ2: カード使用実行処理 (ロジック)
   * PLAY_CARDイベントを受け取り、実際に盤面やステートを更新する
   */
  const handlePlayCard = (payload: CoreEventMap["PLAY_CARD"]) => {
    const { cardId, targetX, targetY } = payload;
    const store = gameQuery.state();
    const cardDef = cardMasterData.find((c) => c.id === cardId);

    if (!cardDef) return;

    store.internal_mutate((draft) => {
      // 1. コスト支払い & 手札消費 (簡易実装)
      // TODO: ここでコスト消費や手札からの削除を行う
      // const player = draft.playerStates[draft.activePlayerId];

      // 2. カード種別ごとの処理
      if (cardDef.cardType === "alien") {
        const alienCard = cardDef as AlienCard;

        const instanceId = `alien-${generateId()}`;
        const newInstance = {
          instanceId,
          cardDefinitionId: cardId,
          spawnedRound: draft.currentRound,
          currentX: targetX,
          currentY: targetY,
          currentInvasionPower: alienCard.targeting.power,
          currentInvasionShape: alienCard.targeting.shape,
          currentGrowthStage: 0,
          roundsSinceSpawn: 0,
        };

        draft.activeAlienInstances[instanceId] = newInstance;

        // 既に何かある場合の上書き可否はルール次第だが、ここでは強制配置
        draft.gameField.cells[targetY][targetX] = FieldSystem.createAlienCell(
          targetX,
          targetY,
          instanceId
        );

        // ログ記録
        draft.history.push({
          actionId: generateId(),
          type: "PLAY_ALIEN",
          payload: { cardId, x: targetX, y: targetY },
          timestamp: Date.now(),
          round: draft.currentRound
        });
      }
      else if (cardDef.cardType === "eradication") {
        const cell = draft.gameField.cells[targetY][targetX];
        // 外来種マスなら駆除
        if (cell.cellType === "alien_area") {
          if (cell.dominantAlienInstanceId) {
            delete draft.activeAlienInstances[cell.dominantAlienInstanceId];
          }
          draft.gameField.cells[targetY][targetX] = FieldSystem.createBareGroundCell(targetX, targetY);

          // ログ記録
          draft.history.push({
            actionId: generateId(),
            type: "PLAY_ERADICATION",
            payload: { cardId, x: targetX, y: targetY },
            timestamp: Date.now(),
            round: draft.currentRound
          });
        }
      }
    });
  };

  // イベント購読登録
  gameEventBus.on("CELL_CLICK", handleCellClick);
  gameEventBus.on("PLAY_CARD", handlePlayCard);

  // クリーンアップ関数
  return () => {
    gameEventBus.off("CELL_CLICK", handleCellClick);
    gameEventBus.off("PLAY_CARD", handlePlayCard);
  };
};