import { gameEventBus } from "@/core/event-bus/GameEventBus";
import { gameActions } from "@/core/api/actions";
// 変更: Store直接参照をやめ、新しいAPIを使用
import { gameQuery } from "@/core/api/queries";

/**
 * 侵食ロジック
 * ターン終了直前に実行され、外来種の支配領域を広げる
 */
export const initAlienExpansionLogic = () => {
	gameEventBus.on("BEFORE_TURN_END", () => {
		// ✅ Hookではなく、Vanilla API経由で状態を取得
		const field = gameQuery.field();
		const activePlayer = gameQuery.activePlayer();

		// 外来種のターンが終わる時のみ発動
		if (activePlayer !== "alien") return;

		console.log("🦠 Alien Expansion: Calculation Started...");

		const cellsToMutate: { x: number; y: number }[] = [];
		const width = field.width;
		const height = field.height;

		// 1. 侵食源（Core または InvasionArea）を探す
		field.cells.flat().forEach((cell) => {
			// 簡易ロジック: CoreまたはInvasionAreaの周囲を侵食
			if (cell.cellType === "alien_core" || cell.cellType === "alien_invasion_area") {
				// 上下左右の座標を計算
				const neighbors = [
					{ x: cell.x + 1, y: cell.y },
					{ x: cell.x - 1, y: cell.y },
					{ x: cell.x, y: cell.y + 1 },
					{ x: cell.x, y: cell.y - 1 },
				];

				neighbors.forEach((pos) => {
					// 盤面外チェック
					if (pos.x < 0 || pos.x >= width || pos.y < 0 || pos.y >= height) return;

					const targetCell = field.cells[pos.y][pos.x];

					// 侵食対象: 在来種エリア(native_area) または 空き地(empty_area)
					// 既に外来種がいる場所はスキップ
					if (targetCell.cellType === "native_area" || targetCell.cellType === "empty_area") {
						// 50%の確率で侵食リストに追加
						if (Math.random() > 0.5) {
							cellsToMutate.push(pos);
						}
					}
				});
			}
		});

		// 2. 変更を適用
		cellsToMutate.forEach((pos) => {
			console.log(`  -> Expanding to (${pos.x}, ${pos.y})`);
			gameActions.field.mutateCell(pos.x, pos.y, "alien_invasion_area");
		});
	});
};