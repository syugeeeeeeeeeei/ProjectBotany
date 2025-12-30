import { CardDefinition, CellState, FieldState, DirectionType } from "@/shared/types/game-schema";

/**
 * EffectSystem: カードや外来種の幾何学的な影響範囲を計算する
 */
export class EffectSystem {
	static getEffectRange(
		card: CardDefinition,
		targetCell: CellState,
		field: FieldState,
		facingFactor: 1 | -1
	): CellState[] {
		const { width, height, cells } = field;
		const { x: cx, y: cy } = targetCell;
		const coords: { x: number; y: number }[] = [];

		// 1. 「特定の生物種全体」への効果判定
		if ("target" in card.targeting && card.targeting.target === "species") {
			const dominantId =
				(targetCell.cellType === "alien_core" && targetCell.alienInstanceId) ||
				(targetCell.cellType === "alien_invasion_area" && targetCell.dominantAlienInstanceId);

			if (dominantId) {
				cells.flat().forEach((c) => {
					if (
						(c.cellType === "alien_core" && c.alienInstanceId === dominantId) ||
						(c.cellType === "alien_invasion_area" && c.dominantAlienInstanceId === dominantId)
					) {
						coords.push({ x: c.x, y: c.y });
					}
				});
			}
		}
		// 2. 形状（Shape）に基づいた幾何学的な範囲計算
		else if ("shape" in card.targeting) {
			const { power, shape, direction } = card.targeting;

			switch (shape) {
				case "single":
					coords.push({ x: cx, y: cy });
					break;
				case "cross":
					coords.push({ x: cx, y: cy });
					for (let i = 1; i <= power; i++) {
						coords.push(
							{ x: cx, y: cy + i }, { x: cx, y: cy - i },
							{ x: cx + i, y: cy }, { x: cx - i, y: cy }
						);
					}
					break;
				case "range":
					for (let dy = -(power - 1); dy <= (power - 1); dy++) {
						for (let dx = -(power - 1); dx <= (power - 1); dx++) {
							coords.push({ x: cx + dx, y: cy + dy });
						}
					}
					break;
				case "straight": {
					// 波括弧を追加して lexical declaration エラーを修正
					const dir: DirectionType = direction || "vertical";
					const directions: Record<DirectionType, number[]> = {
						up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
						vertical: [0, 1, 0, -1], horizon: [1, 0, -1, 0],
					};
					const move = directions[dir];
					const yMult = (dir === "up" || dir === "down" || dir === "vertical") ? facingFactor : 1;

					for (let i = 1; i <= power; i++) {
						for (let j = 0; j < move.length; j += 2) {
							coords.push({
								x: cx + move[j] * i,
								y: cy + move[j + 1] * i * yMult
							});
						}
					}
					break;
				}
			}
		}

		return coords
			.filter((c) => c.x >= 0 && c.x < width && c.y >= 0 && c.y < height)
			.map((c) => cells[c.y][c.x]);
	}
}