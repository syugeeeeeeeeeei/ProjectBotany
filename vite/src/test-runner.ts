import readline from "readline";
import { useGameStore } from "./store/gameStore";
import { printGameState } from "./utils/testPrinters";

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const askQuestion = (query: string): Promise<string> => {
	return new Promise((resolve) => rl.question(query, resolve));
};

const main = async () => {
	console.log("Starting Project Botany Test Runner...");

	// ゲームループ
	while (true) {
		const state = useGameStore.getState();
		printGameState(state);

		if (state.isGameOver) {
			break;
		}

		// ✨ コマンドの案内を新しい仕様に更新
		const input = await askQuestion(
			"\nEnter command (play <card_id> <x> <y>, move <alien_id_prefix> <x> <y>, turn, quit): "
		);
		const [command, ...args] = input.split(" ");

		try {
			if (command === "quit") {
				break;
			} else if (command === "turn") {
				useGameStore.getState().progressTurn();
			} else if (command === "play") {
				const [cardId, xStr, yStr] = args;
				const x = parseInt(xStr, 10);
				const y = parseInt(yStr, 10);

				if (!cardId) {
					console.log(`Error: Card ID is required.`);
				} else if (isNaN(x) || isNaN(y)) {
					console.log("Error: Invalid coordinates.");
				} else {
					// ✨ カードインスタンスIDではなく、カード定義IDを直接渡すように変更
					useGameStore.getState().playCard(cardId, x, y);
				}
				await askQuestion("Press Enter to continue...");
			} else if (command === "move") {
				const [instanceIdPrefix, xStr, yStr] = args;
				const x = parseInt(xStr, 10);
				const y = parseInt(yStr, 10);

				// ✨ 配置されているエイリアンからIDを前方一致で検索
				const targetInstance = Object.values(state.activeAlienInstances).find(
					(inst) => inst.instanceId.startsWith(instanceIdPrefix)
				);

				if (!targetInstance) {
					console.log(
						`Error: Alien instance with ID prefix "${instanceIdPrefix}" not found.`
					);
				} else if (isNaN(x) || isNaN(y)) {
					console.log("Error: Invalid coordinates.");
				} else {
					useGameStore.getState().moveAlien(targetInstance.instanceId, x, y);
				}
				await askQuestion("Press Enter to continue...");
			}
		} catch (e) {
			console.error("An error occurred:", e);
			await askQuestion("Press Enter to continue...");
		}
	}

	rl.close();
	console.log("Test runner finished.");
};

main();