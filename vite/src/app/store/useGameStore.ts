import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { GAME_SETTINGS } from '../../shared/constants/game-config';
import { GameState, PlayerType, PlayerState, CellState } from '../../shared/types/game-schema';
import { createNativeAreaCell } from '../../features/field-grid/domain/cellHelpers';
import { progressTurnLogic } from '../../features/turn-system/domain/turnLogic';
import { playCardLogic } from '../../features/play-card/domain/playCardLogic';
import { moveAlienLogic } from '../../features/move-alien/domain/moveAlienLogic';
import cardMasterData from '../../data/cardMasterData';

interface GameActions {
	playCard: (cardId: string, targetCell: CellState) => string | void;
	moveAlien: (instanceId: string, targetCell: CellState) => string | void;
	progressTurn: () => void;
	resetGame: () => void;
}

const createInitialPlayerState = (id: PlayerType, name: string): PlayerState => ({
	playerId: id,
	playerName: name,
	facingFactor: id === 'native' ? -1 : 1,
	initialEnvironment: 1,
	currentEnvironment: 1,
	maxEnvironment: 1,
	cardLibrary: [],
	cooldownActiveCards: [],
	limitedCardsUsedCount: {},
});

const createInitialFieldState = () => {
	const { FIELD_WIDTH, FIELD_HEIGHT } = GAME_SETTINGS;
	const cells = Array.from({ length: FIELD_HEIGHT }, (_, y) =>
		Array.from({ length: FIELD_WIDTH }, (_, x) => createNativeAreaCell(x, y))
	);
	return { width: FIELD_WIDTH, height: FIELD_HEIGHT, cells };
};

const createInitialGameState = (): GameState => ({
	currentTurn: 1,
	maximumTurns: GAME_SETTINGS.MAXIMUM_TURNS,
	activePlayerId: 'alien',
	currentPhase: 'summon_phase',
	isGameOver: false,
	winningPlayerId: null,
	gameField: createInitialFieldState(),
	playerStates: {
		native: createInitialPlayerState('native', '在来種'),
		alien: createInitialPlayerState('alien', '外来種'),
	},
	activeAlienInstances: {},
	nativeScore: 0,
	alienScore: 0,
});

export const useGameStore = create(
	immer<GameState & GameActions>((set, get) => ({
		...createInitialGameState(),

		playCard: (cardId, targetCell) => {
			const cardDefId = cardId.split('-instance-')[0];
			const card = cardMasterData.find(c => c.id === cardDefId);
			if (!card) return;

			const result = playCardLogic(get(), card, targetCell, cardId);
			if (typeof result === 'string') return result;
			set(result);
		},

		moveAlien: (instanceId, targetCell) => {
			const result = moveAlienLogic(get(), instanceId, targetCell);
			if (typeof result === 'string') return result;
			set(result);
		},

		progressTurn: () => {
			set(progressTurnLogic(get()));
		},

		resetGame: () => set(createInitialGameState()),
	}))
);