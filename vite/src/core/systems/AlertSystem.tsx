import { useUIStore, NotificationItem } from "@/core/store/uiStore";
import { v4 as uuidv4 } from "uuid";
import { PlayerType } from "@/shared/types";

// 通知のデフォルト表示時間 (ms)
const DEFAULT_DURATION = 3000;

export class AlertSystem {
  private static timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * 通知を追加し、自動削除タイマーをセットする
   */
  static notify(
    message: string,
    type: NotificationItem["type"] = "info",
    player?: PlayerType,
  ) {
    const id = uuidv4();

    // Storeに追加
    useUIStore.getState().pushNotification(message, type, player);

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
