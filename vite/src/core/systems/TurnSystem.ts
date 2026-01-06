// src/core/systems/TurnSystem.ts
import { GameState } from "@/shared/types";
import { gameEventBus } from "../event-bus/GameEventBus";

/**
 * ターン進行に関するビジネスロジックを管理するシステム
 */
export const TurnSystem = {
	/**
	 * 現在のプレイヤーのターンを終了し、次の状態へ遷移させる
	 */
	nextTurn(gameState: GameState): GameState {
		const { activePlayerId } = gameState;

		// 1. 現在のプレイヤーのアクション終了を通知
		gameEventBus.emit("PLAYER_ACTION_END", { playerId: activePlayerId });

		// 2. ターンの遷移ロジック
		if (activePlayerId === "alien") {
			// 外来種(先攻)の終了 -> 在来種(後攻)のターン開始
			const nextState: GameState = {
				...gameState,
				activePlayerId: "native",
			};

			gameEventBus.emit("PLAYER_ACTION_START", { playerId: "native" });
			return nextState;
		} else {
			// 在来種(後攻)の終了 -> ラウンド終了フェーズ(end)へ
			return {
				...gameState,
				currentPhase: "end",
			};
		}
	},
};