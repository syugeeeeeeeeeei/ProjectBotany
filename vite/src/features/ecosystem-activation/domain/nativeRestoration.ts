import { GameState } from "@/shared/types/game-schema";
import {
  createNativeAreaCell,
  createRecoveryPendingAreaCell,
} from "@/features/field-grid/domain/cellHelpers";

/**
 * 在来種の再生ロジック (nativeRestoration)
 * 
 * 【動機】
 * 破壊されたり空き地になったりしたマスが、時間の経過とともに「再生待機中」を経て
 * 再び「在来種」のマスに戻る自然界の自浄作用・再生能力を表現するためです。
 *
 * 【恩恵】
 * - プレイヤーが何もしなくても盤面が徐々に修復されることで、ゲームの長期化を防ぎ、
 *   在来種サイドへの追い風となる自然なリズムを生み出します。
 * - 状態遷移（空き地 -> 再生待機 -> 在来種）を明確に分けることで、
 *   再生を妨害する外来種のロジックなどとの統合が容易になります。
 *
 * 【使用法】
 * ターン進行ロジックから `runNativeActivationPhase(state)` を呼び出して実行します。
 */
/**
 * 在来種アクティベーションフェーズの実行
 * 盤面上の自然な回復（待機状態からの再生）を一括処理するために必要です。
 */
export const runNativeActivationPhase = (state: GameState) => {
  // 更新対象（次に在来種マスになるマス）の抽出
  const cellsToUpdate: {
    x: number;
    y: number;
    cellType: "native" | "pending";
  }[] = [];

  state.gameField.cells.flat().forEach((cell) => {
    // 「再生待機」状態のマスは、次のフェーズで自動的に「在来種」に戻る
    if (cell.cellType === "recovery_pending_area")
      cellsToUpdate.push({ x: cell.x, y: cell.y, cellType: "native" });
  });

  // 在来種への書き換え実行
  cellsToUpdate.forEach((u) => {
    state.gameField.cells[u.y][u.x] = createNativeAreaCell(u.x, u.y);
  });

  // 更新対象（空き地から待機状態になるマス）の抽出
  const emptyToUpdate: { x: number; y: number }[] = [];
  state.gameField.cells.flat().forEach((cell) => {
    // 「空マス」は一定期間後に「再生待機」状態へ移行する
    if (cell.cellType === "empty_area")
      emptyToUpdate.push({ x: cell.x, y: cell.y });
  });

  // 再生待機への書き換え実行
  emptyToUpdate.forEach((u) => {
    state.gameField.cells[u.y][u.x] = createRecoveryPendingAreaCell(
      u.x,
      u.y,
      state.currentTurn,
    );
  });
};
