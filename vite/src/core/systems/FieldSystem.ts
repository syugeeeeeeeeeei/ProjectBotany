// vite/src/core/systems/FieldSystem.ts

import {
  FieldState,
  CellState,
} from "@/shared/types/game-schema";
import { Point, CellType } from "@/shared/types/primitives";

/**
 * フィールド操作に関する純粋関数群
 * (Storeには依存せず、計算ロジックのみを提供する)
 */
export const FieldSystem = {
  /**
   * ゲーム開始時のフィールド初期化
   * - サイズ: width x height
   * - 初期配置: 10個のランダムな「裸地」、残りは全て「在来種」
   */
  initializeField(width: number, height: number): FieldState {
    const cells: CellState[][] = [];

    // 1. まず全マスを「在来種 (native)」で埋める
    for (let y = 0; y < height; y++) {
      const row: CellState[] = [];
      for (let x = 0; x < width; x++) {
        const nativeCell: CellState = {
          x,
          y,
          type: "native",
          ownerId: "native",
          alienUnitId: undefined,
        };
        row.push(nativeCell);
      }
      cells.push(row);
    }

    // 2. ランダムに10箇所を選んで「裸地 (bare)」にする
    const totalCells = width * height;
    const bareCount = 10;
    const bareIndices = new Set<number>();

    // 重複しないようにインデックスを選ぶ
    // (万が一フィールドサイズが10未満の場合は全裸地になるが、仕様上考慮外とする)
    while (bareIndices.size < bareCount && bareIndices.size < totalCells) {
      const randomIndex = Math.floor(Math.random() * totalCells);
      bareIndices.add(randomIndex);
    }

    // 選ばれたインデックスの座標を更新
    bareIndices.forEach((index) => {
      const x = index % width;
      const y = Math.floor(index / width);

      const bareCell: CellState = {
        x,
        y,
        type: "bare",
        ownerId: null,
        alienUnitId: undefined,
      };

      cells[y][x] = bareCell;
    });

    return {
      width,
      height,
      cells,
    };
  },

  /**
   * 座標がフィールド内かチェック
   */
  isValidCoordinate(field: FieldState, p: Point): boolean {
    return p.x >= 0 && p.x < field.width && p.y >= 0 && p.y < field.height;
  },

  /**
   * 座標からセルを取得 (範囲外ならnull)
   */
  getCell(field: FieldState, p: Point): CellState | null {
    // 修正: this.isValidCoordinate ではなく FieldSystem.isValidCoordinate を使用
    // 関数参照として渡された場合の this 落ち対策
    if (!FieldSystem.isValidCoordinate(field, p)) return null;
    return field.cells[p.y][p.x];
  },

  /**
   * フィールド上の特定のセルを更新した新しいフィールドを返す (Immutability helper)
   */
  updateCell(field: FieldState, newCell: CellState): FieldState {
    const { x, y } = newCell;
    // 修正: this -> FieldSystem
    if (!FieldSystem.isValidCoordinate(field, { x, y })) return field;

    // 2次元配列のコピーを作成 (浅いコピーで行まで、該当行は新しく作成)
    const newCells = [...field.cells];
    newCells[y] = [...field.cells[y]];
    newCells[y][x] = newCell;

    return {
      ...field,
      cells: newCells,
    };
  },

  /**
   * 指定範囲のセルを一括更新する
   */
  updateCells(field: FieldState, newCells: CellState[]): FieldState {
    const currentCells = [...field.cells]; // 行の参照コピー

    let isModified = false;
    newCells.forEach((cell) => {
      const { x, y } = cell;
      if (
        x >= 0 &&
        x < field.width &&
        y >= 0 &&
        y < field.height
      ) {
        // 必要に応じて行をコピー（まだコピーされてなければ）
        if (currentCells[y] === field.cells[y]) {
          currentCells[y] = [...field.cells[y]];
        }
        currentCells[y][x] = cell;
        isModified = true;
      }
    });

    if (!isModified) return field;

    return {
      ...field,
      cells: currentCells,
    };
  },

  /**
   * ユーティリティ: 特定の種類のセルをカウントする
   */
  countCellsByType(field: FieldState, type: CellType): number {
    let count = 0;
    for (const row of field.cells) {
      for (const cell of row) {
        if (cell.type === type) {
          count++;
        }
      }
    }
    return count;
  },

  /**
   * ユーティリティ: 特定の種類のセル座標リストを取得
   */
  getCellsByType(field: FieldState, type: CellType): Point[] {
    const points: Point[] = [];
    for (let y = 0; y < field.height; y++) {
      for (let x = 0; x < field.width; x++) {
        if (field.cells[y][x].type === type) {
          points.push({ x, y });
        }
      }
    }
    return points;
  }
};