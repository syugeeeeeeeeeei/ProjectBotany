import { GAME_SETTINGS } from "../../../shared/config/gameConfig";
import type {
	AlienCoreCell,
	AlienInvasionAreaCell,
	EmptyAreaCell,
	FieldState,
	NativeAreaCell,
	RecoveryPendingAreaCell
} from "../../../shared/types/data";

/** 空マスを生成する */
export const createEmptyAreaCell = (x: number, y: number): EmptyAreaCell => ({
	x, y, cellType: "empty_area", ownerId: null,
});

/** 再生待機マスを生成する */
export const createRecoveryPendingAreaCell = (x: number, y: number, turn: number): RecoveryPendingAreaCell => ({
	x, y, cellType: "recovery_pending_area", ownerId: null, recoveryPendingTurn: turn,
});

/** 在来種マスを生成する */
export const createNativeAreaCell = (x: number, y: number): NativeAreaCell => ({
	x, y, cellType: "native_area", ownerId: "native",
});

/** 外来種（コア）マスを生成する */
export const createAlienCoreCell = (x: number, y: number, instanceId: string): AlienCoreCell => ({
	x, y, cellType: "alien_core", ownerId: "alien", alienInstanceId: instanceId,
});

/** 侵略マスを生成する */
export const createAlienInvasionAreaCell = (x: number, y: number, dominantId: string): AlienInvasionAreaCell => ({
	x, y, cellType: "alien_invasion_area", ownerId: "alien", dominantAlienInstanceId: dominantId,
});

/** フィールドの初期状態を生成する */
export const createInitialFieldState = (): FieldState => {
	const cells = Array.from({ length: GAME_SETTINGS.FIELD_HEIGHT }, (_, y) =>
		Array.from({ length: GAME_SETTINGS.FIELD_WIDTH }, (_, x) => createNativeAreaCell(x, y))
	);
	return { width: GAME_SETTINGS.FIELD_WIDTH, height: GAME_SETTINGS.FIELD_HEIGHT, cells };
};