import type { PlayerState, PlayerType } from "../../../shared/types/data";

/**
 * プレイヤーの初期状態を生成する
 */
export const createInitialPlayerState = (id: PlayerType, name: string): PlayerState => {
	const isHandicapPlayer = id === 'native';
	const initialEnv = isHandicapPlayer ? 1 : 1; // ハンデ調整が必要な場合はここを修正

	return {
		playerId: id,
		playerName: name,
		facingFactor: id === 'native' ? -1 : 1,
		initialEnvironment: initialEnv,
		currentEnvironment: initialEnv,
		maxEnvironment: initialEnv,
		cardLibrary: [],
		cooldownActiveCards: [],
		limitedCardsUsedCount: {},
	};
};