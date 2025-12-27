import {
  GameState,
  ActiveAlienInstance,
  AlienCard,
  DirectionType,
} from "@/shared/types/game-schema";
import cardMasterData from "@/data/cardMasterData";
import { getEffectRange } from "@/features/play-card/domain/effectCalculator";
import {
  createAlienInvasionAreaCell,
  createEmptyAreaCell,
} from "@/features/field-grid/domain/cellHelpers";
import { applyGrowthLogic } from "./alienGrowth";

/**
 * 外来種の浸食ロジック (alienExpansion)
 * 
 * 【動機】
 * 盤面に配置された外来種が、その特性（コスト、出現ターン、能力）に基づいて
 * 周囲のマスを塗り替えていく処理を実現するためです。「勢力の強い個体が弱い個体を上書きする」
 * という優先順位の概念を導入し、動的な生態系の競合をシミュレートします。
 *
 * 【恩恵】
 * - 複数の外来種が混在する盤面において、論理的で一貫性のある領域拡大ルールを適用できます。
 * - 浸食範囲（Core/Invasion Area）がゼロになった個体を自動的に消滅させることで、
 *   メモリ管理とゲーム性の両立を図ります。
 * - コストが高いカードほど強い優先順位を持つというルールを中央管理します。
 *
 * 【使用法】
 * `runAlienActivationPhase(state)` を呼び出すことで、全外来種の成長と浸食を一括実行します。
 */
/**
 * 外来種アクティベーションフェーズの実行
 * 全ての外来種に対して「成長」と「浸食（拡散）」を一括して処理するために必要です。
 */
export const runAlienActivationPhase = (state: GameState) => {
  // 各個体の経過ターンをインクリメント
  Object.values(state.activeAlienInstances).forEach((alien) => {
    alien.turnsSinceLastAction += 1;
  });

  // コストと出現順（新しい方が優先）でソート
  // 強い個体（コスト高）が弱い個体を上書きする優先順位を実現するために必要です
  const sortedAliens = Object.values(state.activeAlienInstances).sort(
    (a, b) => {
      const costA =
        cardMasterData.find((c) => c.id === a.cardDefinitionId)?.cost ?? 0;
      const costB =
        cardMasterData.find((c) => c.id === b.cardDefinitionId)?.cost ?? 0;
      if (costA !== costB) return costB - costA;
      return b.spawnedTurn - a.spawnedTurn;
    },
  );

  // 各個体の成長と浸食（領域拡大）を適用
  sortedAliens.forEach((alien) => {
    if (!state.activeAlienInstances[alien.instanceId]) return;
    const cardDef = cardMasterData.find(
      (c) => c.id === alien.cardDefinitionId,
    ) as AlienCard;
    if (!cardDef || cardDef.cardType !== "alien") return;

    // 1. 成長ロジックの適用
    applyGrowthLogic(alien, cardDef);

    // 2. 現在の状態（成長後）に基づいた浸食範囲の計算
    let currentTargeting: AlienCard["targeting"];
    if (alien.currentInvasionShape === "straight") {
      const direction: DirectionType =
        cardDef.targeting.shape === "straight"
          ? cardDef.targeting.direction
          : "vertical";
      currentTargeting = {
        shape: "straight",
        power: alien.currentInvasionPower,
        direction,
      };
    } else {
      currentTargeting = {
        shape: alien.currentInvasionShape,
        power: alien.currentInvasionPower,
      } as any;
    }

    const invasionTargets = getEffectRange(
      { ...cardDef, targeting: currentTargeting } as any,
      state.gameField.cells[alien.currentY][alien.currentX],
      state.gameField,
      1,
    );

    // 3. マスの塗り替え（優先順位チェック付き）
    invasionTargets.forEach((target) => {
      const cell = state.gameField.cells[target.y][target.x];
      if (cell.cellType === "alien_core") return; // コストに関わらず他者のコアは上書き不可

      const existingDominantAlien =
        cell.cellType === "alien_invasion_area"
          ? state.activeAlienInstances[cell.dominantAlienInstanceId]
          : null;

      // 既存の占有者がいないか、自分が優先される場合に上書き
      const shouldOverwrite =
        !existingDominantAlien ||
        checkInvasionPriority(alien, existingDominantAlien);

      if (shouldOverwrite) {
        state.gameField.cells[target.y][target.x] = createAlienInvasionAreaCell(
          target.x,
          target.y,
          alien.instanceId,
        );
      }
    });
  });

  // 支配しているマス（Core + InvasionArea）がゼロになった個体を削除
  // 駆除によって全ての勢力圏を失った植物を盤面から完全に消し去るために必要です
  const dominantCounts = countDominantCells(state);
  Object.keys(state.activeAlienInstances).forEach((instanceId) => {
    if (!dominantCounts[instanceId]) {
      const alienToRemove = state.activeAlienInstances[instanceId];
      const coreCell =
        state.gameField.cells[alienToRemove.currentY][alienToRemove.currentX];
      if (
        coreCell.cellType === "alien_core" &&
        coreCell.alienInstanceId === instanceId
      ) {
        state.gameField.cells[alienToRemove.currentY][alienToRemove.currentX] =
          createEmptyAreaCell(alienToRemove.currentX, alienToRemove.currentY);
      }
      delete state.activeAlienInstances[instanceId];
    }
  });
};

/**
 * 二つの外来種間の優先順位（強弱）を判定する
 * どちらの植物がそのマスを支配すべきか（侵略の競合解決）を決定するために必要です。
 */
const checkInvasionPriority = (
  newAlien: ActiveAlienInstance,
  existingAlien: ActiveAlienInstance,
): boolean => {
  const costA =
    cardMasterData.find((c) => c.id === newAlien.cardDefinitionId)?.cost ?? 0;
  const costB =
    cardMasterData.find((c) => c.id === existingAlien.cardDefinitionId)?.cost ??
    0;

  // よりコストの高いカード個体が優先される
  if (costA !== costB) return costA > costB;

  // コストが同じなら、後から出現した個体（spawnedTurnが大きい）を優先
  return newAlien.spawnedTurn > existingAlien.spawnedTurn;
};

/**
 * 各外来種インスタンスが現在支配しているマスの総数をカウントする
 * 生存判定（支配マスが0になった個体の削除）のために必要です。
 */
const countDominantCells = (state: GameState): { [key: string]: number } => {
  const counts: { [key: string]: number } = {};
  state.gameField.cells.flat().forEach((cell) => {
    if (cell.cellType === "alien_invasion_area")
      counts[cell.dominantAlienInstanceId] =
        (counts[cell.dominantAlienInstanceId] || 0) + 1;
    if (cell.cellType === "alien_core")
      counts[cell.alienInstanceId] = (counts[cell.alienInstanceId] || 0) + 1;
  });
  return counts;
};
