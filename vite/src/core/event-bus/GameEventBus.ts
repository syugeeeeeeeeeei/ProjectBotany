// vite/src/core/event-bus/GameEventBus.ts
/// <reference types="vite/client" />
import mitt, { Emitter } from "mitt";
import { CoreEventMap } from "@/core/types/events";

/**
 * GameEventBus
 * アプリケーション全体をつなぐ神経網
 */
export class GameEventBus {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private emitter: Emitter<any>;

  constructor() {
    // CoreEventMapはインデックスシグネチャを持たないため、
    // mittの厳密な型定義(Record<string, unknown>)と競合する場合がある。
    // そのため、ここでは any でインスタンス化し、メソッド側で型安全性を担保する。
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.emitter = mitt<any>();
  }

  /**
   * イベントを発行する
   */
  emit<K extends keyof CoreEventMap>(key: K, payload: CoreEventMap[K]): void {
    // 開発時のデバッグログ (必要に応じてフィルタリング)
    if (import.meta.env.DEV) {
      console.debug(`[EventBus] emit: ${key}`, payload);
    }
    this.emitter.emit(key, payload);
  }

  /**
   * イベントを購読する
   */
  on<K extends keyof CoreEventMap>(
    key: K,
    handler: (event: CoreEventMap[K]) => void,
  ): void {
    this.emitter.on(key, handler);
  }

  /**
   * イベント購読を解除する
   */
  off<K extends keyof CoreEventMap>(
    key: K,
    handler: (event: CoreEventMap[K]) => void,
  ): void {
    this.emitter.off(key, handler);
  }

  /**
   * 全リスナーを削除する (リセット用)
   */
  clear(): void {
    this.emitter.all.clear();
  }
}

// シングルトンとして公開
export const gameEventBus = new GameEventBus();