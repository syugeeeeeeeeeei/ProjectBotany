import type {
	ActiveAlienInstance,
	CardDefinition,
	CellState,
	FieldState,
} from "../types/data";

/**
 * 全ての侵略インスタンスを適用した新しいセル配列を計算して返します。
 */
export const calculateAllInvasions = (
	currentCells: CellState[][],
	instances: ActiveAlienInstance[],
	cardMasterData: { [id: string]: CardDefinition },
	fieldWidth: number,
	fieldHeight: number
): CellState[][] => {
	// ✨ より確実なディープコピーに変更
	const newCells = JSON.parse(JSON.stringify(currentCells));	

	const sortedInstances = [...instances].sort((a, b) => {
		const cardA = cardMasterData[a.cardDefinitionId];
		const cardB = cardMasterData[b.cardDefinitionId];
		if (cardA.cost !== cardB.cost) {
			return cardA.cost - cardB.cost;
		}
		return a.spawnedTurn - b.spawnedTurn;
	});

	sortedInstances.forEach((instance) => {
		const card = cardMasterData[instance.cardDefinitionId];
		if (!card || !card.baseInvasionPower || !card.baseInvasionShape) {
			return;
		}

		const power = instance.currentInvasionPower;
		const shape = instance.currentInvasionShape;

		for (let y = -power; y <= power; y++) {
			for (let x = -power; x <= power; x++) {
				const distance = Math.abs(x) + Math.abs(y);
				if (distance === 0 || distance > power) continue;

				let inRange = false;
				if (shape === "range") {
					if (distance <= power) inRange = true;
				} else if (shape === "cross") {
					if (Math.abs(x) === 0 || Math.abs(y) === 0) inRange = true;
				}

				if (inRange) {
					const targetX = instance.currentX + x;
					const targetY = instance.currentY + y;

					if (
						targetY >= 0 &&
						targetY < fieldHeight &&
						targetX >= 0 &&
						targetX < fieldWidth
					) {
						const targetCell = newCells[targetY][targetX];
						targetCell.cellType = "alien_invasion_area";
						targetCell.ownerId = instance.ownerId;
						targetCell.dominantAlienInstanceId = instance.instanceId;
					}
				}
			}
		}
	});

	return newCells;
};

/**
 * 支配マスを失ったインスタンスを除去します。
 */
export const removeInstancesWithoutDominatedCells = (
	cells: CellState[][],
	instances: { [id: string]: ActiveAlienInstance }
): {
	newCells: CellState[][];
	newInstances: { [id: string]: ActiveAlienInstance };
} => {
	const stillDominatingInstanceIds = new Set<string>();

	for (const row of cells) {
		for (const cell of row) {
			if (cell.dominantAlienInstanceId) {
				stillDominatingInstanceIds.add(cell.dominantAlienInstanceId);
			}
		}
	}

	const newInstances: { [id: string]: ActiveAlienInstance } = {};
	const removedInstanceIds = new Set<string>();

	for (const instanceId in instances) {
		if (stillDominatingInstanceIds.has(instanceId)) {
			newInstances[instanceId] = instances[instanceId];
		} else {
			removedInstanceIds.add(instanceId);
		}
	}

	if (removedInstanceIds.size === 0) {
		return { newCells: cells, newInstances: instances };
	}

	// ✨ より確実なディープコピーに変更
	const finalCells = JSON.parse(JSON.stringify(cells));
	for (const row of finalCells) {
		for (const cell of row) {
			if (
				cell.cellType === "alien_core" &&
				cell.dominantAlienInstanceId &&
				removedInstanceIds.has(cell.dominantAlienInstanceId)
			) {
				cell.cellType = "empty_area";
				cell.ownerId = null;
				cell.dominantAlienInstanceId = null;
			}
		}
	}

	return { newCells: finalCells, newInstances };
};

/**
 * 外来種をフィールドに配置し、更新されたフィールドの状態を返します。
 */
export const placeAlienCore = (
	fieldState: FieldState,
	instance: ActiveAlienInstance
): FieldState => {
	// ✨ より確実なディープコピーに変更
	const newCells = JSON.parse(JSON.stringify(fieldState.cells));
	const { currentX, currentY, ownerId, instanceId } = instance;

	newCells[currentY][currentX] = {
		...newCells[currentY][currentX],
		cellType: "alien_core",
		ownerId: ownerId,
		dominantAlienInstanceId: instanceId,
	};

	return { ...fieldState, cells: newCells };
};

/**
 * フィールド上のエイリアンの位置を更新します。
 */
export const updateAlienPosition = (
	fieldState: FieldState,
	instance: ActiveAlienInstance,
	newX: number,
	newY: number
): FieldState => {
	// ✨ より確実なディープコピーに変更
	const newCells = JSON.parse(JSON.stringify(fieldState.cells));
	const { currentX, currentY, ownerId, instanceId } = instance;

	newCells[currentY][currentX] = {
		...newCells[currentY][currentX],
		cellType: "alien_invasion_area",
	};

	newCells[newY][newX] = {
		...newCells[newY][newX],
		cellType: "alien_core",
		ownerId: ownerId,
		dominantAlienInstanceId: instanceId,
	};

	return { ...fieldState, cells: newCells };
};