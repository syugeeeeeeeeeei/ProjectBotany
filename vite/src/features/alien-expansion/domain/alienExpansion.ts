import {
	GameState,
	ActiveAlienInstance,
	AlienCard,
} from "@/shared/types/game-schema";
import cardMasterData from "@/data/cardMasterData";
import { getEffectRange } from "@/features/play-card/domain/effectCalculator";
import {
	createAlienInvasionAreaCell,
	createEmptyAreaCell,
} from "@/features/field-grid/domain/cellHelpers";

/**
 * 外来種の浸食ロジック (alienExpansion)
 * * 【動機】
 * 盤面に配置された外来種が、その特性に基づいて周囲のマスを塗り替えていく処理を実現するためです。
 * 旧来の「コアからの拡散」ではなく、「支配している全マス（コア＋侵略マス）からの拡散」を行うことで、
 * 強力な繁殖力と、止めなければ手のつけられなくなる脅威をシミュレートします。
 *
 * 【変更点 (Phase 3)】
 * - 侵略元を「インスタンスの位置」から「フィールド上の全外来種マス」に変更しました。
 * - 侵略力パラメータ（currentInvasionPower）を廃止し、常に CardDefinition の値を使用します。
 *
 * 【使用法】
 * `runAlienExpansionPhase(state)` を呼び出すことで、全外来種の浸食を一括実行します。
 */

/**
 * 外来種浸食フェーズの実行
 * 全ての外来種支配マスを起点として、新たな侵略を一括して処理します。
 */
export const runAlienExpansionPhase = (state: GameState, _payload?: any): GameState => {
	// コストと出現順（新しい方が優先）でソート
	// 強い個体（コスト高）が弱い個体を上書きする優先順位を実現するために必要です
	const sortedAliens = Object.values(state.activeAlienInstances).sort(
		(a, b) => {
			const costA =
				cardMasterData.find((c) => c.id === a.cardDefinitionId)?.cost ?? 0;
			const costB =
				cardMasterData.find((c) => c.id === b.cardDefinitionId)?.cost ?? 0;
			if (costA !== costB) return costB - costA;
			return b.spawnedTurn - a.spawnedTurn;
		},
	);

	// 各個体の浸食（領域拡大）を適用
	sortedAliens.forEach((alien) => {
		if (!state.activeAlienInstances[alien.instanceId]) return;
		const cardDef = cardMasterData.find(
			(c) => c.id === alien.cardDefinitionId,
		) as AlienCard;
		if (!cardDef || cardDef.cardType !== "alien") return;

		// 1. この外来種が支配している全てのマス（コア + 侵略マス）を特定
		const ownedCells = state.gameField.cells.flat().filter(cell =>
			(cell.cellType === 'alien_core' && cell.alienInstanceId === alien.instanceId) ||
			(cell.cellType === 'alien_invasion_area' && cell.dominantAlienInstanceId === alien.instanceId)
		);

		// 2. 各支配マスを起点に、侵略範囲を計算
		ownedCells.forEach(sourceCell => {
			// Phase 3: パラメータではなく、常にカード定義の targeting を使用する
			const invasionTargets = getEffectRange(
				cardDef,
				sourceCell,
				state.gameField,
				1, // 外来種の拡散は常に一定方向（あるいはカード定義依存）とする
			);

			// 3. マスの塗り替え（優先順位チェック付き）
			invasionTargets.forEach((target) => {
				const cell = state.gameField.cells[target.y][target.x];

				// 自分のコアや支配地は上書き不要（処理軽減）
				if (cell.cellType === "alien_core") return;
				if (cell.cellType === "alien_invasion_area" && cell.dominantAlienInstanceId === alien.instanceId) return;

				const existingDominantAlien =
					cell.cellType === "alien_invasion_area"
						? state.activeAlienInstances[cell.dominantAlienInstanceId]
						: null;

				// 既存の占有者がいないか、自分が優先される場合に上書き
				const shouldOverwrite =
					!existingDominantAlien ||
					checkInvasionPriority(alien, existingDominantAlien);

				if (shouldOverwrite) {
					state.gameField.cells[target.y][target.x] = createAlienInvasionAreaCell(
						target.x,
						target.y,
						alien.instanceId,
					);
				}
			});
		});
	});

	// 支配しているマス（Core + InvasionArea）がゼロになった個体を削除
	// 駆除によって全ての勢力圏を失った植物を盤面から完全に消し去るために必要です
	const dominantCounts = countDominantCells(state);
	Object.keys(state.activeAlienInstances).forEach((instanceId) => {
		if (!dominantCounts[instanceId]) {
			const alienToRemove = state.activeAlienInstances[instanceId];
			// ※通常ここには来ないが、念のためコアマスもクリア
			const coreCell =
				state.gameField.cells[alienToRemove.currentY][alienToRemove.currentX];
			if (
				coreCell.cellType === "alien_core" &&
				coreCell.alienInstanceId === instanceId
			) {
				state.gameField.cells[alienToRemove.currentY][alienToRemove.currentX] =
					createEmptyAreaCell(alienToRemove.currentX, alienToRemove.currentY);
			}
			delete state.activeAlienInstances[instanceId];
		}
	});

	return state;
};

/**
 * 二つの外来種間の優先順位（強弱）を判定する
 * どちらの植物がそのマスを支配すべきか（侵略の競合解決）を決定するために必要です。
 */
const checkInvasionPriority = (
	newAlien: ActiveAlienInstance,
	existingAlien: ActiveAlienInstance,
): boolean => {
	const costA =
		cardMasterData.find((c) => c.id === newAlien.cardDefinitionId)?.cost ?? 0;
	const costB =
		cardMasterData.find((c) => c.id === existingAlien.cardDefinitionId)?.cost ??
		0;

	// よりコストの高いカード個体が優先される
	if (costA !== costB) return costA > costB;

	// コストが同じなら、後から出現した個体（spawnedTurnが大きい）を優先
	return newAlien.spawnedTurn > existingAlien.spawnedTurn;
};

/**
 * 各外来種インスタンスが現在支配しているマスの総数をカウントする
 * 生存判定（支配マスが0になった個体の削除）のために必要です。
 */
const countDominantCells = (state: GameState): { [key: string]: number } => {
	const counts: { [key: string]: number } = {};
	state.gameField.cells.flat().forEach((cell) => {
		if (cell.cellType === "alien_invasion_area")
			counts[cell.dominantAlienInstanceId] =
				(counts[cell.dominantAlienInstanceId] || 0) + 1;
		if (cell.cellType === "alien_core")
			counts[cell.alienInstanceId] = (counts[cell.alienInstanceId] || 0) + 1;
	});
	return counts;
};