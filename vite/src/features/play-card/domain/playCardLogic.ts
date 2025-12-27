import { produce } from "immer";
import {
  GameState,
  CardDefinition,
  CellState,
  AlienCard,
  EradicationCard,
  RecoveryCard,
  ActiveAlienInstance,
} from "@/shared/types/game-schema";
import { generateId } from "@/shared/utils/id";
import {
  createAlienCoreCell,
  createEmptyAreaCell,
  createRecoveryPendingAreaCell,
  createNativeAreaCell,
} from "@/features/field-grid/domain/cellHelpers";
import { getEffectRange } from "./effectCalculator";

/** 外来種カードの効果を適用する */
const applyAlienCard = (
  state: GameState,
  card: AlienCard,
  targetCell: CellState,
) => {
  const newAlienInstance: ActiveAlienInstance = {
    instanceId: generateId(),
    cardDefinitionId: card.id,
    spawnedTurn: state.currentTurn,
    currentX: targetCell.x,
    currentY: targetCell.y,
    currentGrowthStage: 0,
    currentInvasionPower: card.targeting.power,
    currentInvasionShape: card.targeting.shape,
    turnsSinceLastAction: 0,
  };
  state.activeAlienInstances[newAlienInstance.instanceId] = newAlienInstance;
  state.gameField.cells[targetCell.y][targetCell.x] = createAlienCoreCell(
    targetCell.x,
    targetCell.y,
    newAlienInstance.instanceId,
  );
};

/** 駆除カードの効果を適用する */
const applyEradicationCard = (
  state: GameState,
  card: EradicationCard,
  effectRange: CellState[],
) => {
  effectRange.forEach((target) => {
    const cellToUpdate = state.gameField.cells[target.y][target.x];
    if (
      cellToUpdate.cellType === "alien_core" &&
      state.activeAlienInstances[cellToUpdate.alienInstanceId]
    ) {
      delete state.activeAlienInstances[cellToUpdate.alienInstanceId];
    }
    if (card.postRemovalState === "empty_area") {
      state.gameField.cells[target.y][target.x] = createEmptyAreaCell(
        target.x,
        target.y,
      );
    } else {
      state.gameField.cells[target.y][target.x] = createRecoveryPendingAreaCell(
        target.x,
        target.y,
        state.currentTurn,
      );
    }
  });
};

/** 回復カードの効果を適用する */
const applyRecoveryCard = (
  state: GameState,
  card: RecoveryCard,
  effectRange: CellState[],
) => {
  effectRange.forEach((target) => {
    const cellToUpdate = state.gameField.cells[target.y][target.x];
    if (
      cellToUpdate.cellType === "empty_area" ||
      cellToUpdate.cellType === "recovery_pending_area" ||
      ("target" in card.targeting && card.targeting.target === "species")
    ) {
      if (card.postRecoveryState === "native_area") {
        state.gameField.cells[target.y][target.x] = createNativeAreaCell(
          target.x,
          target.y,
        );
      } else {
        state.gameField.cells[target.y][target.x] =
          createRecoveryPendingAreaCell(target.x, target.y, state.currentTurn);
      }
    }
  });
};

/**
 * カードの使用を試みるメインロジック。
 */
export const playCardLogic = (
  state: GameState,
  card: CardDefinition,
  targetCell: CellState,
  instanceId: string,
): GameState | string => {
  const { activePlayerId } = state;
  const currentPlayer = state.playerStates[activePlayerId];

  // バリデーション
  if (currentPlayer.currentEnvironment < card.cost)
    return "エンバイロメントが足りません！";
  if (
    card.cardType === "alien" &&
    (targetCell.cellType === "empty_area" ||
      targetCell.cellType === "recovery_pending_area" ||
      targetCell.cellType === "alien_core")
  )
    return "このマスには配置できません";
  if (
    card.cardType === "recovery" &&
    !("target" in card.targeting && card.targeting.target === "species") &&
    targetCell.cellType !== "empty_area" &&
    targetCell.cellType !== "recovery_pending_area"
  )
    return "このマスは回復できません。";
  if (card.cardType === "eradication" && targetCell.cellType === "native_area")
    return "在来種マスは駆除対象にできません。";

  return produce(state, (draft) => {
    const newPlayerState = draft.playerStates[activePlayerId];
    const effectRange = getEffectRange(
      card,
      targetCell,
      draft.gameField,
      newPlayerState.facingFactor,
    );

    switch (card.cardType) {
      case "alien":
        applyAlienCard(draft, card, targetCell);
        break;
      case "eradication":
        applyEradicationCard(draft, card, effectRange);
        break;
      case "recovery":
        applyRecoveryCard(draft, card, effectRange);
        break;
    }

    newPlayerState.currentEnvironment -= card.cost;
    if (card.cooldownTurns) {
      newPlayerState.cooldownActiveCards.push({
        cardId: instanceId,
        turnsRemaining: card.cooldownTurns,
      });
    }
    if (card.usageLimit) {
      newPlayerState.limitedCardsUsedCount[card.id] =
        (newPlayerState.limitedCardsUsedCount[card.id] || 0) + 1;
    }
  });
};
