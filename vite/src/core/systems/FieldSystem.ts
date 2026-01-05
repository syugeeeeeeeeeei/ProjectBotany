// vite/src/core/systems/FieldSystem.ts
import {
  CellState,
  NativeAreaCell,
  BareGroundAreaCell,
  PioneerVegetationAreaCell,
  AlienAreaCell,
  FieldState,
} from "@/shared/types/game-schema";
import { GAME_SETTINGS } from "@/shared/constants/game-config";

export class FieldSystem {
  /**
   * フィールドの初期化
   * 全て在来種マスで埋め尽くされた状態を作成します
   */
  static initField(
    width: number = GAME_SETTINGS.FIELD_WIDTH,
    height: number = GAME_SETTINGS.FIELD_HEIGHT,
  ): FieldState {
    const cells: CellState[][] = [];
    for (let y = 0; y < height; y++) {
      const row: CellState[] = [];
      for (let x = 0; x < width; x++) {
        row.push(this.createNativeCell(x, y));
      }
      cells.push(row);
    }
    return { width, height, cells };
  }

  // --- Factory Methods ---

  static createNativeCell(x: number, y: number): NativeAreaCell {
    return {
      x,
      y,
      cellType: "native_area",
      ownerId: "native",
    };
  }

  static createBareGroundCell(x: number, y: number): BareGroundAreaCell {
    return {
      x,
      y,
      cellType: "bare_ground_area",
      ownerId: null,
    };
  }

  static createPioneerCell(
    x: number,
    y: number,
    currentRound: number,
  ): PioneerVegetationAreaCell {
    return {
      x,
      y,
      cellType: "pioneer_vegetation_area",
      ownerId: null,
      createdRound: currentRound,
    };
  }

  static createAlienCell(
    x: number,
    y: number,
    instanceId: string, // このマスを支配している外来種インスタンスID
  ): AlienAreaCell {
    return {
      x,
      y,
      cellType: "alien_area",
      ownerId: "alien",
      dominantAlienInstanceId: instanceId,
    };
  }

  // --- Utility Methods ---

  /**
   * 座標がフィールド内か判定
   */
  static isValidPos(x: number, y: number, field: FieldState): boolean {
    return x >= 0 && x < field.width && y >= 0 && y < field.height;
  }
}