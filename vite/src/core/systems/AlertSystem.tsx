// vite/src/core/systems/AlertSystem.tsx
import {
  useUIStore,
  NotificationItem,
  NotificationTarget,
} from "@/core/store/uiStore";
import { useGameStore } from "@/core/store/gameStore"; // ✨ 追加: アクティブプレイヤー取得用
import { v4 as uuidv4 } from "uuid";

// 通知のデフォルト表示時間 (ms)
const DEFAULT_DURATION = 3000;

export class AlertSystem {
  private static timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * 通知を追加し、自動削除タイマーをセットする
   * target が 'current' の場合は現在のターンプレイヤーに解決される
   */
  static notify(
    message: string,
    type: NotificationItem["type"] = "info",
    target: "native" | "alien" | "broadcast" | "current" = "current", // ✨ 修正: target指定に対応
  ) {
    const id = uuidv4();

    // ターゲットの解決
    let resolvedTarget: NotificationTarget;
    if (target === "current") {
      // 現在のStore状態からアクティブプレイヤーを取得
      resolvedTarget = useGameStore.getState().activePlayerId;
    } else {
      resolvedTarget = target;
    }

    // Storeに追加
    useUIStore.getState().pushNotification(message, type, resolvedTarget);

    // 自動削除タイマーのセット
    this.scheduleRemoval(id, DEFAULT_DURATION);
  }

  /**
   * 通知の手動削除（UIからのクリックなど）
   */
  static remove(id: string) {
    // タイマーがあればクリア
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id)!);
      this.timers.delete(id);
    }
    // Storeから削除
    useUIStore.getState().removeNotification(id);
  }

  /**
   * タイマー登録の内部ロジック
   */
  private static scheduleRemoval(id: string, duration: number) {
    // 既存の同IDタイマーがあればクリア（念のため）
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id)!);
    }

    const timer = setTimeout(() => {
      this.remove(id);
    }, duration);

    this.timers.set(id, timer);
  }
}
