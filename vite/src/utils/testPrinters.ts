import type {
	ActiveAlienInstance,
	CardDefinition,
	FieldState,
	GameState,
	PlayerState,
} from "../types/data";

// フィールドの状態を見やすく表示する
const printField = (field: FieldState) => {
	console.log("--- FIELD ---");
	const header = "   " + Array.from(Array(field.width).keys()).join(" ");
	console.log(header);
	console.log("  " + "-".repeat(field.width * 2));

	field.cells.forEach((row, y) => {
		const rowStr = row
			.map((cell) => {
				if (cell.cellType === "alien_core") return "🔴";
				if (cell.cellType === "alien_invasion_area") return "🟪";
				if (cell.cellType === "native_area") return "🟩";
				if (cell.cellType === "recovery_pending_area") return "🟨"; // ✨ 追加
				return "⬜️"; // empty_area
			})
			.join(" ");
		console.log(`${y}| ${rowStr}`);
	});
	console.log("-------------");
};

// プレイヤーの状態を見やすく表示する
const printPlayerState = (
	playerState: PlayerState,
	cardMasterData: { [id: string]: CardDefinition }
) => {
	console.log(`\n=== ${playerState.playerName} ===`);
	console.log(
		`Environment: ${playerState.currentEnvironment}/${playerState.maxEnvironment}`
	);
	console.log("Playable Cards:");
	playerState.playableCardIds.forEach((cardId) => {
		const def = cardMasterData[cardId];
		const onCooldown = playerState.cooldownActiveCards.some(
			(c) => c.cardId === cardId
		);
		const status = onCooldown
			? `(Cooldown: ${playerState.cooldownActiveCards.find((c) => c.cardId === cardId)
				?.turnsRemaining
			} turns)`
			: `(Cost: ${def?.cost})`;
		console.log(`  - [ID: ${def?.id}] ${def?.name} ${status}`);
	});
};

const printActiveAliens = (
	instances: { [id: string]: ActiveAlienInstance },
	field: FieldState
) => {
	console.log("\n--- Active Aliens on Field & Dominated Cells ---");
	const instanceList = Object.values(instances);
	if (instanceList.length === 0) {
		console.log("  None");
		console.log("------------------------------------------------");
		return;
	}
	instanceList.forEach((instance) => {
		const dominatedCells: string[] = [];
		field.cells.forEach((row) => {
			row.forEach((cell) => {
				if (cell.dominantAlienInstanceId === instance.instanceId) {
					dominatedCells.push(`(${cell.x},${cell.y})`);
				}
			});
		});

		console.log(
			`  - [ID: ${instance.instanceId.substring(0, 4)}] at (${instance.currentX
			}, ${instance.currentY})`
		);
		console.log(`    Dominating: ${dominatedCells.join(", ") || "None"}`);
	});
	console.log("------------------------------------------------");
};

// ゲーム全体の状態を表示する
export const printGameState = (state: GameState) => {
	console.clear();
	console.log(
		`========== Turn: ${state.currentTurn}, Phase: ${state.currentPhase} ==========`
	);
	console.log(
		`Active Player: ${state.playerStates[state.activePlayerId]?.playerName}`
	);

	printField(state.gameField);
	printActiveAliens(state.activeAlienInstances, state.gameField);
	printPlayerState(state.playerStates.alien_side, state.cardMasterData);
	printPlayerState(state.playerStates.native_side, state.cardMasterData);

	if (state.isGameOver) {
		console.log("\n!!!!!!!!!! GAME OVER !!!!!!!!!!");
		const winner = state.winningPlayerId
			? state.playerStates[state.winningPlayerId]?.playerName
			: "Draw";
		console.log(`Winner: ${winner}`);
	}
};