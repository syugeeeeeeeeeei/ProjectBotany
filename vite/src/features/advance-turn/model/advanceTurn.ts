import { produce } from "immer";
import { updateAlienGrowth } from "../../../entities/alien/model/growthLogic";
import cardMasterData from "../../../entities/card/model/cardMasterData";
import {
	createAlienInvasionAreaCell,
	createEmptyAreaCell,
	createNativeAreaCell,
	createRecoveryPendingAreaCell
} from "../../../entities/field/model/fieldLogic";
import { GAME_SETTINGS } from "../../../shared/config/gameConfig";
import type { AlienCard, CellState, GameState, PlayerType } from "../../../shared/types/data";
import { getEffectRange } from "../../play-card"; // Public APIからインポート

export const progressTurnLogic = (state: GameState): GameState => {
	if (state.isGameOver) return state;

	return produce(state, draft => {
		// 活性フェーズ処理
		if (draft.activePlayerId === "alien") {
			Object.values(draft.activeAlienInstances).forEach(a => a.turnsSinceLastAction += 1);
			const sortedAliens = Object.values(draft.activeAlienInstances).sort((a, b) => {
				const costA = cardMasterData.find(c => c.id === a.cardDefinitionId)?.cost ?? 0;
				const costB = cardMasterData.find(c => c.id === b.cardDefinitionId)?.cost ?? 0;
				return costA !== costB ? costB - costA : b.spawnedTurn - a.spawnedTurn;
			});

			sortedAliens.forEach(alien => {
				const cardDef = cardMasterData.find(c => c.id === alien.cardDefinitionId) as AlienCard;
				if (!cardDef) return;
				updateAlienGrowth(alien, cardDef);

				const currentTargeting = alien.currentInvasionShape === 'straight'
					? { shape: 'straight' as const, power: alien.currentInvasionPower, direction: (cardDef.targeting as any).direction || 'vertical' }
					: { shape: alien.currentInvasionShape as any, power: alien.currentInvasionPower };

				const invasionTargets = getEffectRange({ ...cardDef, targeting: currentTargeting } as any, draft.gameField.cells[alien.currentY][alien.currentX], draft.gameField, 1);

				// targetの型を明示的に指定してエラーを解決
				invasionTargets.forEach((target: CellState) => {
					const cell = draft.gameField.cells[target.y][target.x];
					if (cell.cellType === "alien_core") return;
					const existing = cell.cellType === "alien_invasion_area" ? draft.activeAlienInstances[cell.dominantAlienInstanceId] : null;
					const costNew = cardMasterData.find(c => c.id === alien.cardDefinitionId)?.cost ?? 0;
					const costExisting = existing ? (cardMasterData.find(c => c.id === existing.cardDefinitionId)?.cost ?? 0) : 0;

					const shouldOverwrite = !existing || (costNew > costExisting);
					if (shouldOverwrite) draft.gameField.cells[target.y][target.x] = createAlienInvasionAreaCell(target.x, target.y, alien.instanceId);
				});
			});

			// 支配マス0の除去
			Object.keys(draft.activeAlienInstances).forEach(id => {
				const hasCell = draft.gameField.cells.flat().some(c => (c.cellType === "alien_invasion_area" && c.dominantAlienInstanceId === id) || (c.cellType === "alien_core" && c.alienInstanceId === id));
				if (!hasCell) {
					const alien = draft.activeAlienInstances[id];
					draft.gameField.cells[alien.currentY][alien.currentX] = createEmptyAreaCell(alien.currentX, alien.currentY);
					delete draft.activeAlienInstances[id];
				}
			});
		} else {
			const toUpdate: { x: number, y: number, cell: CellState }[] = [];
			draft.gameField.cells.flat().forEach(c => {
				if (c.cellType === "recovery_pending_area") toUpdate.push({ x: c.x, y: c.y, cell: createNativeAreaCell(c.x, c.y) });
			});
			toUpdate.forEach(u => draft.gameField.cells[u.y][u.x] = u.cell);
			toUpdate.length = 0;
			draft.gameField.cells.flat().forEach(c => {
				if (c.cellType === "empty_area") toUpdate.push({ x: c.x, y: c.y, cell: createRecoveryPendingAreaCell(c.x, c.y, draft.currentTurn) });
			});
			toUpdate.forEach(u => draft.gameField.cells[u.y][u.x] = u.cell);
		}

		// ターン交代とリソース回復
		const nextPlayerId: PlayerType = draft.activePlayerId === "alien" ? "native" : "alien";
		const nextTurn = nextPlayerId === "alien" ? draft.currentTurn + 1 : draft.currentTurn;

		Object.values(draft.playerStates).forEach(p => {
			p.maxEnvironment = (nextTurn - 1) + p.initialEnvironment;
			p.currentEnvironment = p.maxEnvironment;
			p.cooldownActiveCards = p.cooldownActiveCards.map(c => ({ ...c, turnsRemaining: c.turnsRemaining - 1 })).filter(c => c.turnsRemaining > 0);
		});

		draft.currentTurn = nextTurn;
		draft.activePlayerId = nextPlayerId;
		draft.isGameOver = nextTurn > GAME_SETTINGS.MAXIMUM_TURNS;
		if (draft.isGameOver) {
			draft.nativeScore = draft.gameField.cells.flat().filter(c => c.ownerId === "native").length;
			draft.alienScore = draft.gameField.cells.flat().filter(c => c.ownerId === "alien").length;
			draft.winningPlayerId = draft.nativeScore > draft.alienScore ? "native" : draft.alienScore > draft.nativeScore ? "alien" : null;
		}
	});
};