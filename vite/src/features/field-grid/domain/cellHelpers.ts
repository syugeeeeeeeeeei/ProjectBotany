import {
	EmptyAreaCell,
	RecoveryPendingAreaCell,
	NativeAreaCell,
	AlienCoreCell,
	AlienInvasionAreaCell
} from '../../../shared/types/game-schema';

/** 空マス（EmptyAreaCell）を生成する */
export const createEmptyAreaCell = (x: number, y: number): EmptyAreaCell => ({
	x, y, cellType: "empty_area", ownerId: null,
});

/** 再生待機マス（RecoveryPendingAreaCell）を生成する */
export const createRecoveryPendingAreaCell = (x: number, y: number, turn: number): RecoveryPendingAreaCell => ({
	x, y, cellType: "recovery_pending_area", ownerId: null, recoveryPendingTurn: turn,
});

/** 在来種マス（NativeAreaCell）を生成する */
export const createNativeAreaCell = (x: number, y: number): NativeAreaCell => ({
	x, y, cellType: "native_area", ownerId: "native",
});

/** 外来種（コア）マス（AlienCoreCell）を生成する */
export const createAlienCoreCell = (x: number, y: number, instanceId: string): AlienCoreCell => ({
	x, y, cellType: "alien_core", ownerId: "alien", alienInstanceId: instanceId,
});

/** 侵略マス（AlienInvasionAreaCell）を生成する */
export const createAlienInvasionAreaCell = (x: number, y: number, dominantId: string): AlienInvasionAreaCell => ({
	x, y, cellType: "alien_invasion_area", ownerId: "alien", dominantAlienInstanceId: dominantId,
});