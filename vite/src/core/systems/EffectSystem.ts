// vite/src/core/systems/EffectSystem.ts
import {
  CardDefinition,
  FieldState,
} from "@/shared/types"; // 修正: @/shared/types からインポート
import { Point, ShapeType, DirectionType } from "@/shared/types"; // 修正
import { FieldSystem } from "./FieldSystem";

export class EffectSystem {
  /**
   * カードの効果範囲（対象となるマスの座標リスト）を取得する
   */
  static getEffectRange(
    card: CardDefinition,
    origin: Point,
    field: FieldState,
    directionFactor: 1 | -1 = 1, // 1: Alien(上から), -1: Native(下から)
  ): Point[] {
    // CardDefinitionにtargetingプロパティが型定義上で存在しない可能性があるため、
    // 一度 any として扱って安全にアクセスする
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = card as any;

    // targetingプロパティがない、またはfalsyな場合は空配列
    if (!c.targeting) return [];

    const targeting = c.targeting;

    // targetingが "species" (種指定) の場合、座標範囲はない
    if (targeting.target === "species") {
      return [];
    }

    // ここまでくれば shape と power を持つとみなしてキャスト
    const { shape, power, direction } = targeting as {
      shape: ShapeType;
      power: number;
      direction?: DirectionType;
    };

    return this.calculateShapeArea(
      origin,
      shape,
      power,
      field,
      direction,
      directionFactor,
    );
  }

  /**
   * 形状ごとの座標計算
   */
  static calculateShapeArea(
    origin: Point,
    shape: ShapeType,
    power: number,
    field: FieldState,
    cardDirection?: DirectionType,
    directionFactor: number = 1,
  ): Point[] {
    const targets: Point[] = [];
    const { x: ox, y: oy } = origin;

    // 範囲内判定ヘルパー
    const addIfValid = (tx: number, ty: number) => {
      if (FieldSystem.isValidCoordinate(field, { x: tx, y: ty })) {
        targets.push({ x: tx, y: ty });
      }
    };

    // Range (周囲正方形)
    if (shape === "range") {
      for (let dy = -power; dy <= power; dy++) {
        for (let dx = -power; dx <= power; dx++) {
          if (dx === 0 && dy === 0) continue; // 起点は含めない
          addIfValid(ox + dx, oy + dy);
        }
      }
    }
    // Cross (十字)
    else if (shape === "cross") {
      for (let d = 1; d <= power; d++) {
        addIfValid(ox, oy + d);
        addIfValid(ox, oy - d);
        addIfValid(ox + d, oy);
        addIfValid(ox - d, oy);
      }
    }
    // Straight (直線)
    else if (shape === "straight") {
      let dx = 0;
      let dy = 0;

      if (cardDirection === "vertical" || !cardDirection) {
        dy = 1 * directionFactor; // 前方
      } else if (cardDirection === "horizon") {
        // 横一列の実装（将来拡張用）
      } else if (cardDirection === "up") dy = -1;
      else if (cardDirection === "down") dy = 1;
      else if (cardDirection === "left") dx = -1;
      else if (cardDirection === "right") dx = 1;

      for (let i = 1; i <= power; i++) {
        addIfValid(ox + dx * i, oy + dy * i);
      }
    }
    // Single (単体)
    else {
      addIfValid(ox, oy);
    }

    return targets;
  }
}