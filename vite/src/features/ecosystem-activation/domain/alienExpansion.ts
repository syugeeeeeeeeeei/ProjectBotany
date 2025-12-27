import { GameState, ActiveAlienInstance, AlienCard, DirectionType } from '../../../shared/types/game-schema';
import cardMasterData from '../../../data/cardMasterData';
import { getEffectRange } from '../../play-card/domain/effectCalculator';
import { createAlienInvasionAreaCell, createEmptyAreaCell } from '../../field-grid/domain/cellHelpers';
import { applyGrowthLogic } from './alienGrowth';

/**
 * 外来種サイドの活性フェーズ（成長・拡散・除去）を実行する。
 */
export const runAlienActivationPhase = (state: GameState) => {
	Object.values(state.activeAlienInstances).forEach(alien => {
		alien.turnsSinceLastAction += 1;
	});

	const sortedAliens = Object.values(state.activeAlienInstances).sort((a, b) => {
		const costA = cardMasterData.find(c => c.id === a.cardDefinitionId)?.cost ?? 0;
		const costB = cardMasterData.find(c => c.id === b.cardDefinitionId)?.cost ?? 0;
		if (costA !== costB) return costB - costA;
		return b.spawnedTurn - a.spawnedTurn;
	});

	sortedAliens.forEach(alien => {
		if (!state.activeAlienInstances[alien.instanceId]) return;
		const cardDef = cardMasterData.find(c => c.id === alien.cardDefinitionId) as AlienCard;
		if (!cardDef || cardDef.cardType !== "alien") return;

		applyGrowthLogic(alien, cardDef);

		let currentTargeting: AlienCard['targeting'];
		if (alien.currentInvasionShape === 'straight') {
			const direction: DirectionType = cardDef.targeting.shape === 'straight' ? cardDef.targeting.direction : 'vertical';
			currentTargeting = { shape: 'straight', power: alien.currentInvasionPower, direction };
		} else {
			currentTargeting = { shape: alien.currentInvasionShape, power: alien.currentInvasionPower } as any;
		}

		const invasionTargets = getEffectRange({ ...cardDef, targeting: currentTargeting } as any, state.gameField.cells[alien.currentY][alien.currentX], state.gameField, 1);

		invasionTargets.forEach(target => {
			const cell = state.gameField.cells[target.y][target.x];
			if (cell.cellType === "alien_core") return;

			const existingDominantAlien = cell.cellType === "alien_invasion_area" ? state.activeAlienInstances[cell.dominantAlienInstanceId] : null;
			const shouldOverwrite = !existingDominantAlien || checkInvasionPriority(alien, existingDominantAlien);

			if (shouldOverwrite) {
				state.gameField.cells[target.y][target.x] = createAlienInvasionAreaCell(target.x, target.y, alien.instanceId);
			}
		});
	});

	const dominantCounts = countDominantCells(state);
	Object.keys(state.activeAlienInstances).forEach(instanceId => {
		if (!dominantCounts[instanceId]) {
			const alienToRemove = state.activeAlienInstances[instanceId];
			const coreCell = state.gameField.cells[alienToRemove.currentY][alienToRemove.currentX];
			if (coreCell.cellType === "alien_core" && coreCell.alienInstanceId === instanceId) {
				state.gameField.cells[alienToRemove.currentY][alienToRemove.currentX] = createEmptyAreaCell(alienToRemove.currentX, alienToRemove.currentY);
			}
			delete state.activeAlienInstances[instanceId];
		}
	});
};

const checkInvasionPriority = (newAlien: ActiveAlienInstance, existingAlien: ActiveAlienInstance): boolean => {
	const costA = cardMasterData.find(c => c.id === newAlien.cardDefinitionId)?.cost ?? 0;
	const costB = cardMasterData.find(c => c.id === existingAlien.cardDefinitionId)?.cost ?? 0;
	if (costA !== costB) return costA > costB;
	return newAlien.spawnedTurn > existingAlien.spawnedTurn;
};

const countDominantCells = (state: GameState): { [key: string]: number } => {
	const counts: { [key: string]: number } = {};
	state.gameField.cells.flat().forEach(cell => {
		if (cell.cellType === "alien_invasion_area") counts[cell.dominantAlienInstanceId] = (counts[cell.dominantAlienInstanceId] || 0) + 1;
		if (cell.cellType === "alien_core") counts[cell.alienInstanceId] = (counts[cell.alienInstanceId] || 0) + 1;
	});
	return counts;
};