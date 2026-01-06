// vite/src/core/event-bus/GameEventBus.ts
/// <reference types="vite/client" />
import mitt, { Emitter } from "mitt";
import { CoreEventMap } from "@/core/types/events";

/**
 * GameEventBus
 * アプリケーション全体をつなぐ神経網
 */
export class GameEventBus {
  private emitter: Emitter<CoreEventMap>;

  constructor() {
    this.emitter = mitt<CoreEventMap>();
  }

  /**
   * イベントを発行する
   * ジェネリクスにより、CoreEventMapで定義された正しいペイロードのみを受け付ける
   */
  emit<K extends keyof CoreEventMap>(key: K, payload: CoreEventMap[K]): void {
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