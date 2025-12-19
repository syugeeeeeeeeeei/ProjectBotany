import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import cardMasterData from '../../entities/card/model/cardMasterData';
import { createInitialFieldState } from '../../entities/field/model/fieldLogic';
import { createInitialPlayerState } from '../../entities/player/model/playerState';
import { progressTurnLogic } from '../../features/advance-turn/model/advanceTurn';
import { moveAlienLogic } from '../../features/move-alien/model/moveAlien';
import { playCardLogic } from '../../features/play-card/model/playCard';
import { GAME_SETTINGS } from '../../shared/config/gameConfig';
import type {
	CellState,
	GameState,
	PlayerType
} from '../../shared/types/data';

interface UIState {
	selectedCardId: string | null;
	selectedAlienInstanceId: string | null;
	notification: { message: string; forPlayer: PlayerType } | null;
	previewPlacement: { x: number; y: number } | null;
	isCardPreview: boolean;
}

interface UIActions {
	playSelectedCard: () => void;
	progressTurn: () => void;
	moveAlien: (targetCell: CellState) => void;
	selectCard: (cardId: string) => void;
	deselectCard: () => void;
	selectAlienInstance: (instanceId: string | null) => void;
	setNotification: (message: string | null, forPlayer?: PlayerType) => void;
	resetGame: () => void;
	setPreviewPlacement: (position: { x: number; y: number } | null) => void;
}

type GameStore = GameState & UIState & UIActions;

const DEFAULT_PREVIEW_POSITION = { x: 3, y: 5 };

const createInitialGameState = (): GameState => ({
	currentTurn: 1,
	maximumTurns: GAME_SETTINGS.MAXIMUM_TURNS,
	activePlayerId: 'alien',
	currentPhase: 'summon_phase',
	isGameOver: false,
	winningPlayerId: null,
	gameField: createInitialFieldState(),
	playerStates: {
		native: createInitialPlayerState('native', '在来種サイド'),
		alien: createInitialPlayerState('alien', '外来種サイド'),
	},
	activeAlienInstances: {},
	nativeScore: 0,
	alienScore: 0,
});

export const useGameStore = create<GameStore>()(
	immer((set, get) => ({
		...createInitialGameState(),
		selectedCardId: null,
		selectedAlienInstanceId: null,
		notification: null,
		previewPlacement: null,
		isCardPreview: false,

		playSelectedCard: () => {
			const { selectedCardId, previewPlacement, gameField } = get();
			if (!selectedCardId || !previewPlacement) return;
			const card = cardMasterData.find(c => c.id === selectedCardId.split('-instance-')[0]);
			if (!card) return;

			const targetCell = gameField.cells[previewPlacement.y][previewPlacement.x];
			const result = playCardLogic(get(), card, targetCell);

			if (typeof result === 'string') {
				set({ notification: { message: result, forPlayer: get().activePlayerId } });
			} else {
				set({ ...result, selectedCardId: null, previewPlacement: null, isCardPreview: false });
			}
		},

		progressTurn: () => {
			const nextState = progressTurnLogic(get());
			set({ ...nextState, selectedCardId: null, selectedAlienInstanceId: null, previewPlacement: null, isCardPreview: false });
		},

		moveAlien: (targetCell) => {
			const { selectedAlienInstanceId } = get();
			if (!selectedAlienInstanceId) return;
			const result = moveAlienLogic(get(), selectedAlienInstanceId, targetCell);
			if (typeof result === 'string') {
				set({ notification: { message: result, forPlayer: get().activePlayerId } });
			} else {
				set({ ...result, selectedAlienInstanceId: null });
			}
		},

		selectCard: (cardId) => set((state) => {
			const cardDefId = cardId.split('-instance-')[0];
			const player = state.playerStates[state.activePlayerId];

			if (player.cooldownActiveCards.some(c => c.cardId === cardDefId)) {
				state.notification = { message: `このカードはクールタイム中です。`, forPlayer: state.activePlayerId };
				return;
			}
			const cardDef = cardMasterData.find(c => c.id === cardDefId);
			if (!cardDef) return;

			const limit = cardDef.usageLimit;
			const usedCount = player.limitedCardsUsedCount[cardDef.id] || 0;
			if (limit && usedCount >= limit) {
				state.notification = { message: `このカードは最大使用回数に達しています。`, forPlayer: state.activePlayerId };
				return;
			}

			state.selectedCardId = cardId;
			state.selectedAlienInstanceId = null;
			state.previewPlacement = DEFAULT_PREVIEW_POSITION;
			state.isCardPreview = true;
		}),

		deselectCard: () => set({ selectedCardId: null, previewPlacement: null, isCardPreview: false }),

		selectAlienInstance: (instanceId) => set((state) => {
			if (state.activePlayerId !== 'alien') {
				state.notification = { message: "外来種側のターンではありません。", forPlayer: 'native' };
				return;
			}
			if (state.selectedAlienInstanceId === instanceId) {
				state.selectedAlienInstanceId = null;
				return;
			}
			state.selectedAlienInstanceId = instanceId;
			state.selectedCardId = null;
			state.previewPlacement = null;
			state.isCardPreview = false;
		}),

		setNotification: (message, forPlayer) => set((state) => {
			state.notification = message && forPlayer ? { message, forPlayer } : null;
		}),

		resetGame: () => set({ ...createInitialGameState(), selectedCardId: null, selectedAlienInstanceId: null, notification: null, previewPlacement: null, isCardPreview: false }),

		setPreviewPlacement: (position) => set((state) => {
			state.previewPlacement = position;
		}),
	}))
);