import { BOARD_LAYOUT, GAME_SETTINGS } from "../config/gameConfig";

/**
 * グリッド座標 (x, y) を 3D 空間の座標 [x, y, z] に変換する
 */
export const getPositionFromCoords = (x: number, y: number): [number, number, number] => [
	(x - (GAME_SETTINGS.FIELD_WIDTH - 1) / 2) * BOARD_LAYOUT.CELL_GAP,
	0,
	(y - (GAME_SETTINGS.FIELD_HEIGHT - 1) / 2) * BOARD_LAYOUT.CELL_GAP,
];