import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import {
	CARD_MASTER_DATA,
	INITIAL_ENVIRONMENT,
	INITIAL_FIELD_HEIGHT,
	INITIAL_FIELD_WIDTH,
	MAX_ENVIRONMENT,
	MAX_TURN,
	PLAYER_IDS,
} from "../constants/game";
import {
	processCardPlay,
	processTurnProgression,
	processAlienMove,
} from "../logic/gameLogic";
import type {
	CellState,
	FieldState,
	GameActions,
	GameState,
	GameStore,
	PlayerId,
} from "../types/data";

// createInitialFieldは変更なし
const createInitialField = (width: number, height: number): FieldState => {
	const cells: CellState[][] = [];
	for (let y = 0; y < height; y++) {
		const row: CellState[] = [];
		for (let x = 0; x < width; x++) {
			row.push({
				x,
				y,
				cellType: "native_area",
				ownerId: PLAYER_IDS.NATIVE_SIDE,
				dominantAlienInstanceId: null,
			});
		}
		cells.push(row);
	}
	return { width, height, cells };
};


// ✨ デッキではなく、使用可能なカードIDのプールを作成する関数に変更
const createInitialCardPool = (side: PlayerId): string[] => {
	return Object.values(CARD_MASTER_DATA)
		.filter((card) => {
			if (side === PLAYER_IDS.ALIEN_SIDE) {
				return card.cardType === "alien";
			} else {
				return card.cardType === "eradication" || card.cardType === "recovery";
			}
		})
		.map((card) => card.id);
};

const initialAlienCardPool = createInitialCardPool(PLAYER_IDS.ALIEN_SIDE);
const initialNativeCardPool = createInitialCardPool(PLAYER_IDS.NATIVE_SIDE);

const initialState: GameState = {
	currentTurn: 1,
	maximumTurns: MAX_TURN,
	activePlayerId: PLAYER_IDS.ALIEN_SIDE,
	gameField: createInitialField(INITIAL_FIELD_WIDTH, INITIAL_FIELD_HEIGHT),
	cardMasterData: CARD_MASTER_DATA,
	playerStates: {
		alien_side: {
			playerId: PLAYER_IDS.ALIEN_SIDE,
			playerName: "外来種サイド",
			currentEnvironment: INITIAL_ENVIRONMENT,
			maxEnvironment: MAX_ENVIRONMENT,
			playableCardIds: initialAlienCardPool, // ✨ hand/deck/discardを撤廃
			cooldownActiveCards: [],
			limitedCardsUsedCount: {},
		},
		native_side: {
			playerId: PLAYER_IDS.NATIVE_SIDE,
			playerName: "在来種サイド",
			currentEnvironment: INITIAL_ENVIRONMENT,
			maxEnvironment: MAX_ENVIRONMENT,
			playableCardIds: initialNativeCardPool, // ✨ hand/deck/discardを撤廃
			cooldownActiveCards: [],
			limitedCardsUsedCount: {},
		},
	},
	currentPhase: "preparation",
	isGameOver: false,
	winningPlayerId: null,
	activeAlienInstances: {},
};

const actions = (
	set: (fn: (state: GameStore) => Partial<GameStore> | GameStore) => void,
	get: () => GameStore
): GameActions => ({
	progressTurn: () => {
		const updatedState = processTurnProgression(get());
		set((state) => ({ ...state, ...updatedState }));
	},

	playCard: (cardDefinitionId: string, x: number, y: number) => { // ✨ 引数を変更
		const updatedState = processCardPlay(get(), cardDefinitionId, x, y);
		if (updatedState) {
			set((state) => ({ ...state, ...updatedState }));
		}
	},

	moveAlien: (instanceId: string, targetX: number, targetY: number) => {
		const updatedState = processAlienMove(get(), instanceId, targetX, targetY);
		if (updatedState) {
			set((state) => ({ ...state, ...updatedState }));
		}
	},
});

export const useGameStore = create<GameStore>((set, get) => ({
	...initialState,
	...actions(set, get),
}));