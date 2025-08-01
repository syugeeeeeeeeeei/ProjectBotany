import { MAX_TURNS, alienMaster, nativeMaster } from '../constants/game';
import type {
	Cell,
	GameState,
	Piece,
	PlayLog
} from '../types/data';

// Note: このファイルは副作用のない純粋な関数群で構成される

/**
 * 現在のゲーム状態と一つの操作ログを受け取り、次のゲーム状態を返すReducer関数
 * @param state - 現在のGameState
 * @param log - 適用するPlayLog
 * @returns 更新されたGameStateの一部
 */
export const gameReducer = (
	state: GameState,
	log: PlayLog,
): Partial<GameState> => {
	switch (log.type) {
		case 'PLACE_PIECE': {
			if (!log.payload.cardId || log.payload.cellId === undefined) return {};

			const newPiece: Piece = {
				id: state.pieces.length,
				type: log.payload.playerId,
				cardId: log.payload.cardId,
				cellId: log.payload.cellId,
				placedTurn: state.turn,
			};
			const newPieces = [...state.pieces, newPiece];
			const newCells = updateDominance(state.cells, newPieces);
			return { pieces: newPieces, cells: newCells };
		}

		case 'USE_CARD': {
			const { cardId, cellId } = log.payload;
			if (!cardId || cellId === undefined) return {};

			const card = nativeMaster[cardId];
			if (!card) return {}; // 対象カードがマスタに存在しない

			// --- ここからカード効果の分岐 ---

			// 「単体駆除」の効果
			if (card.id === 'native-remove') {
				const targetPieceIndex = state.pieces.findIndex(
					(p) => p.cellId === cellId && p.type === 'alien',
				);

				if (targetPieceIndex === -1) return {}; // 駆除対象がいない

				const newPieces = state.pieces.filter(
					(_, index) => index !== targetPieceIndex,
				);
				const newCells = updateDominance(state.cells, newPieces);

				return { pieces: newPieces, cells: newCells };
			}

			// TODO: 他のカード効果を実装

			return {};
		}

		default:
			return state;
	}
};

/**
 * 活性化フェーズの処理を行う
 * (外来種の成長・拡散、マスの再生など)
 * @param state - 現在のGameState
 * @returns 更新されたGameStateの一部
 */
export const resolveActivationPhase = (
	state: GameState,
): Partial<GameState> => {
	// ■ 1. 外来種の成長
	const grownPieces = state.pieces.map((piece) => {
		if (piece.type === 'alien') {
			const master = alienMaster[piece.cardId];
			// 成長条件と次のIDが定義されているかチェック
			if (master.growth_conditions?.turn && master.next_alien_id) {
				const turnsOnBoard = state.turn - piece.placedTurn;
				// 条件判定 (経過ターン数)
				if (turnsOnBoard >= master.growth_conditions.turn) {
					// 成長後の新しいIDでコマを更新
					return { ...piece, cardId: master.next_alien_id };
				}
			}
		}
		return piece;
	});

	// ■ 2. 外来種の拡散 (未実装)
	// TODO: 拡散ロジックを実装

	// ■ 3. マスの自動再生 (未実装)
	// TODO: 再生待機マスのターンを減らし、0になったら再生するロジックを実装
	const regeneratedCells = state.cells;

	const updatedPieces = grownPieces;
	const updatedCells = updateDominance(regeneratedCells, updatedPieces);

	return { pieces: updatedPieces, cells: updatedCells };
};

/**
 * 勝利条件を判定し、ゲームの終了状態を返す
 * @param state - 現在のGameState
 * @returns ゲームが終了していれば、終了状態と勝者情報。継続ならnull。
 */
export const checkVictory = (state: GameState): Partial<GameState> | null => {
	const alienCells = state.cells.filter((c) => c.dominant === 'alien').length;
	const nativeCells = state.cells.filter((c) => c.dominant === 'native').length;

	// 条件1: 支配マス消滅
	if (alienCells === 0 && state.pieces.some((p) => p.type === 'alien')) {
		return { gameStatus: 'ended', winner: 'native' };
	}
	if (nativeCells === 0 && state.pieces.some((p) => p.type === 'native')) {
		return { gameStatus: 'ended', winner: 'alien' };
	}

	// 条件2: ターン上限
	if (state.turn > MAX_TURNS) {
		let winner: GameState['winner'] = 'draw';
		if (alienCells > nativeCells) winner = 'alien';
		if (nativeCells > alienCells) winner = 'native';
		return { gameStatus: 'ended', winner };
	}

	// どちらの条件も満たさなければゲーム続行
	return null;
};

/**
 * 次のプレイヤーへターンを渡す処理を行う
 * @param state - 現在のGameState
 * @returns 更新されたGameStateの一部
 */
export const advanceToNextPlayer = (
	state: GameState,
): Partial<GameState> => {
	// ■ プレイヤー交代
	const nextPlayerId = state.currentPlayerId === 'alien' ? 'native' : 'alien';
	const isNewRound = nextPlayerId === 'alien';
	const nextTurn = isNewRound ? state.turn + 1 : state.turn;

	// ■ ターン上限の勝利判定
	const victoryStateByTurnLimit = checkVictory({ ...state, turn: nextTurn });
	if (victoryStateByTurnLimit) {
		return victoryStateByTurnLimit;
	}

	// ■ 環境フェーズの処理 (次のプレイヤー分)
	const updatedEnv = { ...state.environment };
	updatedEnv[nextPlayerId].max = nextTurn;
	updatedEnv[nextPlayerId].current = updatedEnv[nextPlayerId].max;

	return {
		currentPlayerId: nextPlayerId,
		turn: nextTurn,
		environment: updatedEnv,
		gameStatus: 'player_turn', // プレイヤーの操作待ち状態に戻す
	};
};

/**
 * ピースの配置状況から、各セルの支配状況を再計算する
 * @param cells
 * @param pieces
 * @returns 更新されたセルの配列
 */
export const updateDominance = (cells: Cell[], pieces: Piece[]): Cell[] => {
	const newCells: Cell[] = cells.map((cell) => ({
		...cell,
		dominant: undefined,
	}));

	for (const piece of pieces) {
		if (newCells[piece.cellId]) {
			newCells[piece.cellId].dominant = piece.type;
		}
	}
	return newCells;
};