import {
  CellState,
  CellType, // setCellType で使用
  EmptyAreaCell,
  RecoveryPendingAreaCell,
  NativeAreaCell,
  AlienCoreCell,
  AlienInvasionAreaCell,
} from "@/shared/types/game-schema";
import { useGameStore } from "@/core/store/gameStore";
import { GAME_SETTINGS } from "@/shared/constants/game-config";

/**
 * FieldSystem: 盤面の物理的な状態変更を司る
 */
export class FieldSystem {
  // --- セル生成ヘルパー (Legacy の完全再現) ---

  static createEmptyCell(x: number, y: number): EmptyAreaCell {
    return { x, y, cellType: "empty_area", ownerId: null };
  }

  static createNativeCell(x: number, y: number): NativeAreaCell {
    return { x, y, cellType: "native_area", ownerId: "native" };
  }

  static createRecoveryPendingCell(x: number, y: number, turn: number): RecoveryPendingAreaCell {
    return { x, y, cellType: "recovery_pending_area", ownerId: null, recoveryPendingTurn: turn };
  }

  static createAlienCoreCell(x: number, y: number, instanceId: string): AlienCoreCell {
    return { x, y, cellType: "alien_core", ownerId: "alien", alienInstanceId: instanceId };
  }

  static createAlienInvasionCell(x: number, y: number, dominantId: string): AlienInvasionAreaCell {
    return { x, y, cellType: "alien_invasion_area", ownerId: "alien", dominantAlienInstanceId: dominantId };
  }

  // --- システムアクション ---

  /** 盤面初期化 */
  static initializeField() {
    useGameStore.getState().internal_mutate((draft) => {
      const { FIELD_WIDTH, FIELD_HEIGHT } = GAME_SETTINGS;
      draft.gameField.cells = Array.from({ length: FIELD_HEIGHT }, (_, y) =>
        Array.from({ length: FIELD_WIDTH }, (_, x) => this.createNativeCell(x, y))
      );
    });
  }

  /** 任意のセルオブジェクトで上書き */
  static setCell(x: number, y: number, cell: CellState) {
    useGameStore.getState().internal_mutate((draft) => {
      if (draft.gameField.cells[y]?.[x]) {
        draft.gameField.cells[y][x] = cell;
      }
    });
  }

  /** 特定のタイプに変更（簡易更新用） */
  static setCellType(x: number, y: number, type: CellType) {
    useGameStore.getState().internal_mutate((draft) => {
      // type 引数を使用してエラーを解消
      let newCell: CellState;
      switch (type) {
        case "empty_area": newCell = this.createEmptyCell(x, y); break;
        case "native_area": newCell = this.createNativeCell(x, y); break;
        // その他のタイプも必要に応じて作成
        default: newCell = this.createNativeCell(x, y);
      }
      draft.gameField.cells[y][x] = newCell;
    });
  }
}