import {
  CellState,
  CellType,
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

  /** 任意のセルオブジェクトで上書き (インスタンスごとの置換) */
  static setCell(x: number, y: number, cell: CellState) {
    useGameStore.getState().internal_mutate((draft) => {
      if (draft.gameField.cells[y]?.[x]) {
        draft.gameField.cells[y][x] = cell;
      }
    });
  }

  /** * セルの内部状態を部分的に更新 (プロパティ書き換え用) 
   * action.field.updateCell から呼び出される
   */
  static mutateCell(x: number, y: number, updater: (cell: CellState) => void) {
    useGameStore.getState().internal_mutate((draft) => {
      const cell = draft.gameField.cells[y]?.[x];
      if (cell) {
        // Immerのドラフト状態のcellをupdaterに渡して直接変更させる
        updater(cell);
      }
    });
  }

  /** 特定のタイプに変更（簡易更新用） */
  static setCellType(x: number, y: number, type: CellType) {
    useGameStore.getState().internal_mutate((draft) => {
      let newCell: CellState;
      // 型に応じて適切な生成メソッドを呼ぶ
      switch (type) {
        case "empty_area":
          newCell = this.createEmptyCell(x, y);
          break;
        case "native_area":
          newCell = this.createNativeCell(x, y);
          break;
        case "recovery_pending_area":
          // ※注: 本来はターン数などの引数が必要だが、簡易的な型変更としてデフォルト値を設定
          newCell = this.createRecoveryPendingCell(x, y, 0);
          break;
        // 他のタイプが必要な場合はここに追加
        default:
          // デフォルトフォールバック
          newCell = this.createNativeCell(x, y);
      }
      draft.gameField.cells[y][x] = newCell;
    });
  }
}