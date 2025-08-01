import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { INITIAL_CELLS } from '../constants/game';
import type { CardId, GameState, PlayLog } from '../types/data';
import {
	advanceToNextPlayer,
	checkVictory,
	gameReducer,
	resolveActivationPhase,
} from '../utils/gameLogic';

// Action
export type GameActions = {
	placePiece: (cellId: number, cardId: CardId) => void;
	useCard: (cellId: number, cardId: CardId) => void;
	endTurn: () => void;
};

const initialState: GameState = {
	turn: 1,
	currentPlayerId: 'alien',
	gameStatus: 'player_turn',
	winner: null,
	cells: INITIAL_CELLS,
	pieces: [],
	environment: {
		alien: { current: 1, max: 1 },
		native: { current: 1, max: 1 },
	},
	cooldowns: {},
	gameLog: [],
};

export const useGameStore = create<GameState & GameActions>()(
	devtools(
		(set, get) => ({
			...initialState,

			// ----------------------------------------------------------------
			// Actions
			// ----------------------------------------------------------------

			placePiece: (cellId, cardId) => {
				const log: PlayLog = {
					type: 'PLACE_PIECE',
					payload: { playerId: get().currentPlayerId, cardId, cellId },
				};
				const nextState = gameReducer(get(), log);
				set((state) => ({
					...nextState,
					gameLog: [...state.gameLog, log],
				}));
			},

			useCard: (cellId, cardId) => {
				const log: PlayLog = {
					type: 'USE_CARD',
					payload: { playerId: get().currentPlayerId, cardId, cellId },
				};
				const nextState = gameReducer(get(), log);
				set((state) => ({
					...nextState,
					gameLog: [...state.gameLog, log],
				}));
			},

			endTurn: () => {
				if (get().gameStatus !== 'player_turn') return;
				set({ gameStatus: 'resolving' });

				const stateAfterActivation = resolveActivationPhase(get());
				set(stateAfterActivation);

				let victoryState = checkVictory(get());
				if (victoryState) {
					set(victoryState);
					return;
				}

				const stateAfterAdvance = advanceToNextPlayer(get());
				set(stateAfterAdvance);
			},
		}),
		{ name: 'GameStore' },
	),
);