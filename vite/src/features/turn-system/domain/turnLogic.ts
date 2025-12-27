import { produce } from "immer";
import { GameState, PlayerType } from "@/shared/types/game-schema";
import { ActionRegistry } from "@/app/registry/ActionRegistry";

/**
 * ターン進行ロジック (progressTurnLogic)
 * * 【動機】
 * ターンが終了する際に発生する「世界の更新」を原子的に実行するためです。
 * 外来種の浸食、在来種の再生、環境適応力の回復、クールダウンの減少、
 * スコアの再集計、そしてゲーム終了判定といった一連のドメインルールを順番に適用します。
 *
 * 【恩恵】
 * - 盤面全体の走査と集計を一箇所で行うため、スコアの不一致などの矛盾が発生しません。
 * - `ActionRegistry` 経由で他機能のドメインロジックを呼び出すことで、
 * 各機能の独立性を保ちつつ、ターンという時間軸上で統合できます。
 * - `config.ts` で無効化された機能はレジストリに登録されないため、自動的にスキップされます。
 *
 * 【使用法】
 * `ActionRegistry` に `PROGRESS_TURN` として登録され、`useGameStore` の `dispatch` 経由で実行されます。
 */
/**
 * ターン進行アクション（PROGRESS_TURN）のメインロジック
 * 世界の時間の進み（活性化、交代、集計、勝利判定）を一本化して実行するために必要です
 */
export const progressTurnLogic = (
  state: GameState,
  _payload?: any,
): GameState => {
  return produce(state, (draft) => {
    // --- 1. 生態系活性フェーズの実行 ---
    // Configで有効化されている場合のみ、レジストリから取得できて実行される
    // これにより、機能のON/OFFをコードの書き換えなしに切り替えられます

    // 1-1. 外来種の浸食 (ALIEN_EXPANSION)
    const expansionLogic = ActionRegistry.get("ALIEN_EXPANSION");
    if (expansionLogic) {
      // Immerのdraftを渡して実行（型アサーションで整合性を確保）
      expansionLogic(draft as GameState, null);
    }

    // 1-2. 在来種の再生 (NATIVE_RESTORATION)
    const restorationLogic = ActionRegistry.get("NATIVE_RESTORATION");
    if (restorationLogic) {
      restorationLogic(draft as GameState, null);
    }

    // 1-3. 外来種の成長 (ALIEN_GROWTH)
    const growthLogic = ActionRegistry.get("ALIEN_GROWTH");
    if (growthLogic) {
      growthLogic(draft as GameState, null);
    }

    // --- 2. ターン進行とプレイヤー交代 ---
    const currentPlayerId = draft.activePlayerId;

    // 両者が1回ずつ行動を終えたらターン数をインクリメント
    if (currentPlayerId === "native") {
      draft.currentTurn += 1;
    }

    // プレイヤーの権限を交代
    const nextPlayerId: PlayerType =
      currentPlayerId === "alien" ? "native" : "alien";
    draft.activePlayerId = nextPlayerId;

    // 次のプレイヤーのリソース（Environment）を全回復し、最大値を成長させる
    const nextPlayer = draft.playerStates[nextPlayerId];
    if (nextPlayer.maxEnvironment < 10) {
      nextPlayer.maxEnvironment += 1;
    }
    nextPlayer.currentEnvironment = nextPlayer.maxEnvironment;

    // 使用済みカードのクールダウン（残りターン数）を減少させ、0以下になったら解除
    nextPlayer.cooldownActiveCards = nextPlayer.cooldownActiveCards
      .map((c) => ({ ...c, turnsRemaining: c.turnsRemaining - 1 }))
      .filter((c) => c.turnsRemaining > 0);

    // フェーズをリセット（現在は召喚フェーズのみ）
    draft.currentPhase = "summon_phase";

    // --- 3. スコア集計と勝敗判定 ---
    // 盤面上の全マスを走査し、現在の勢力がどちらに傾いているかを算出
    let nativeCount = 0;
    let alienCount = 0;

    draft.gameField.cells.flat().forEach((cell) => {
      if (cell.cellType === "native_area") {
        nativeCount++;
      } else if (
        cell.cellType === "alien_core" ||
        cell.cellType === "alien_invasion_area"
      ) {
        alienCount++;
      }
    });

    draft.nativeScore = nativeCount;
    draft.alienScore = alienCount;

    // 設定された最大ターン数に達したらゲーム終了
    if (draft.currentTurn > draft.maximumTurns) {
      draft.isGameOver = true;

      // 在来種エリアが多いか、外来種エリアが多いかで勝者を決定
      if (nativeCount > alienCount) {
        draft.winningPlayerId = "native";
      } else if (alienCount > nativeCount) {
        draft.winningPlayerId = "alien";
      } else {
        draft.winningPlayerId = null; // スコアが等しい場合は引き分け
      }
    }
  });
};