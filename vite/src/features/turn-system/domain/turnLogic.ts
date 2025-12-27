import { produce } from 'immer';
import { GameState, PlayerType } from '../../../shared/types/game-schema';
import { GAME_SETTINGS } from '../../../shared/constants/game-config';
import { runAlienActivationPhase } from '../../ecosystem-activation/domain/alienExpansion';
import { runNativeActivationPhase } from '../../ecosystem-activation/domain/nativeRestoration';

/**
 * ターンを進行させ、活性フェーズとリソース回復を行う。
 */
export const progressTurnLogic = (state: GameState): GameState => {
	if (state.isGameOver) return state;

	return produce(state, draft => {
		if (draft.activePlayerId === "alien") runAlienActivationPhase(draft);
		else runNativeActivationPhase(draft);

		const nextPlayerId: PlayerType = draft.activePlayerId === "alien" ? "native" : "alien";
		const nextTurn = nextPlayerId === "alien" ? draft.currentTurn + 1 : draft.currentTurn;

		(Object.keys(draft.playerStates) as PlayerType[]).forEach(playerId => {
			const player = draft.playerStates[playerId];
			const newMaxEnv = (nextTurn - 1) + player.initialEnvironment;
			player.maxEnvironment = newMaxEnv;
			player.currentEnvironment = newMaxEnv;
			player.cooldownActiveCards = player.cooldownActiveCards
				.map(c => ({ ...c, turnsRemaining: c.turnsRemaining - 1 }))
				.filter(c => c.turnsRemaining > 0);
		});

		const isGameOver = nextTurn > GAME_SETTINGS.MAXIMUM_TURNS;
		if (isGameOver && !draft.isGameOver) {
			const nativeScore = draft.gameField.cells.flat().filter(c => c.ownerId === "native").length;
			const alienScore = draft.gameField.cells.flat().filter(c => c.ownerId === "alien").length;
			draft.nativeScore = nativeScore;
			draft.alienScore = alienScore;
			if (nativeScore > alienScore) draft.winningPlayerId = "native";
			else if (alienScore > nativeScore) draft.winningPlayerId = "alien";
			else draft.winningPlayerId = null;
		}

		draft.currentTurn = nextTurn;
		draft.activePlayerId = nextPlayerId;
		draft.isGameOver = isGameOver;
	});
};