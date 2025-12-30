import { CellState, CellType } from "@/shared/types/game-schema";
import { useGameStore } from "@/core/store/gameStore";
import { GAME_SETTINGS } from "@/shared/constants/game-config";

// LegacyのcellHelpersと同等のロジック
// 新アーキテクチャではSystemの一部として定義

const createCell = (x: number, y: number, type: CellType): CellState => {
  const base = { x, y };
  switch (type) {
    case "native_area":
      return { ...base, cellType: "native_area", ownerId: "native" };
    case "empty_area":
      return { ...base, cellType: "empty_area", ownerId: null };

    // ▼ 追加: 外来種侵略エリア
    case "alien_invasion_area":
      return {
        ...base,
        cellType: "alien_invasion_area",
        ownerId: "alien",
        // 本来はカードや外来種IDを渡すべきですが、Phase 4動作確認用としてダミーIDを設定
        dominantAlienInstanceId: "temp-id",
      };

    // ▼ 追加: 外来種コア
    case "alien_core":
      return {
        ...base,
        cellType: "alien_core",
        ownerId: "alien",
        alienInstanceId: "temp-id",
      };

    // ▼ 追加: 再生待機エリア
    case "recovery_pending_area":
      return {
        ...base,
        cellType: "recovery_pending_area",
        ownerId: null,
        recoveryPendingTurn: useGameStore.getState().currentTurn + 1,
      };

    default:
      return { ...base, cellType: "native_area", ownerId: "native" };
  }
};

export class FieldSystem {
  /**
   * 盤面を初期化する
   * 全てNativeAreaで埋める
   */
  static initializeField() {
    useGameStore.getState().internal_mutate((draft) => {
      const { FIELD_WIDTH, FIELD_HEIGHT } = GAME_SETTINGS;
      const cells = Array.from({ length: FIELD_HEIGHT }, (_, y) =>
        Array.from({ length: FIELD_WIDTH }, (_, x) =>
          createCell(x, y, "native_area"),
        ),
      );
      draft.gameField.width = FIELD_WIDTH;
      draft.gameField.height = FIELD_HEIGHT;
      draft.gameField.cells = cells;
    });
  }

  /**
   * 特定のセルを更新する
   */
  static mutateCell(x: number, y: number, recipe: (cell: CellState) => void) {
    useGameStore.getState().internal_mutate((draft) => {
      const cell = draft.gameField.cells[y]?.[x];
      if (cell) {
        recipe(cell);
      }
    });
  }

  /**
   * セルを特定タイプで上書きする
   */
  static setCellType(x: number, y: number, type: CellType) {
    useGameStore.getState().internal_mutate((draft) => {
      // 簡易実装: 本来は前の情報を保持するかなど考慮が必要だが、
      // ここでは単純に新しいオブジェクトに入れ替える（プロパティ欠損注意）
      // 実運用では createCell 等を使って安全に置換する
      const newCell = createCell(x, y, type);
      draft.gameField.cells[y][x] = newCell;
    });
  }
}
