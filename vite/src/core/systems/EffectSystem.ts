// vite/src/core/systems/EffectSystem.ts
import {
  CardDefinition,
  FieldState,
} from "@/shared/types/game-schema";
import { Point, ShapeType, DirectionType } from "@/shared/types/primitives";
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
    // ターゲット定義がない場合は空
    if (!("targeting" in card) || !card.targeting) return [];

    // targetingが "species" (種指定) の場合、座標範囲はない
    if ("target" in card.targeting && card.targeting.target === "species") {
      return [];
    }

    // ここまでくれば shape と power を持つ
    // TypeScriptの型ガードのためにキャストまたは絞り込み
    const targeting = card.targeting as {
      shape: ShapeType;
      power: number;
      direction?: DirectionType;
    };

    const { shape, power, direction } = targeting;

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

    // Range (周囲正方形)
    if (shape === "range") {
      for (let dy = -power; dy <= power; dy++) {
        for (let dx = -power; dx <= power; dx++) {
          if (dx === 0 && dy === 0) continue; // 起点は含めない（必要なら含める）
          const tx = ox + dx;
          const ty = oy + dy; // Y軸方向はPlayerの向きに関係なく絶対座標で計算
          if (FieldSystem.isValidPos(tx, ty, field)) {
            targets.push({ x: tx, y: ty });
          }
        }
      }
    }
    // Cross (十字)
    else if (shape === "cross") {
      for (let d = 1; d <= power; d++) {
        const dirs = [
          { x: 0, y: d },
          { x: 0, y: -d },
          { x: d, y: 0 },
          { x: -d, y: 0 },
        ];
        dirs.forEach((dir) => {
          const tx = ox + dir.x;
          const ty = oy + dir.y;
          if (FieldSystem.isValidPos(tx, ty, field)) {
            targets.push({ x: tx, y: ty });
          }
        });
      }
    }
    // Straight (直線)
    else if (shape === "straight") {
      // 指定方向、なければ前方
      // directionFactor: 1(Alien)ならy+方向が「前方」, -1(Native)ならy-方向が「前方」と仮定
      // 要件定義の視点に合わせて調整が必要。ここではAlien(上)→下へ攻めるならy+, Native(下)→上へ攻めるならy-
      let dx = 0;
      let dy = 0;

      if (cardDirection === "vertical" || !cardDirection) {
        dy = 1 * directionFactor; // 前方
      } else if (cardDirection === "horizon") {
        // 横一列のStraight定義がある場合の実装（現在は未定のためスキップ）
      } else if (cardDirection === "up") dy = -1;
      else if (cardDirection === "down") dy = 1;
      else if (cardDirection === "left") dx = -1;
      else if (cardDirection === "right") dx = 1;

      for (let i = 1; i <= power; i++) {
        const tx = ox + dx * i;
        const ty = oy + dy * i;
        if (FieldSystem.isValidPos(tx, ty, field)) {
          targets.push({ x: tx, y: ty });
        }
      }
    }
    // Single (単体)
    else {
      // Singleの場合、Origin自体を含むか、Originの隣接か？
      // 通常はクリックした対象そのもの(Origin)を指すことが多い
      if (FieldSystem.isValidPos(ox, oy, field)) {
        targets.push({ x: ox, y: oy });
      }
    }

    return targets;
  }
}