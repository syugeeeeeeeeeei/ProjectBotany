// src/shared/hooks/useFullscreenHeight.ts

import { useEffect } from "react";

/**
 * フルスクリーン高さ調整フック (useFullscreenHeight)
 * 
 * 【動機】
 * モバイルブラウザにおいて `100vh` がアドレスバーやツールバーを含んでしまい、
 * UI が画面外にはみ出したり隠れたりする問題（いわゆる 100vh 問題）を解決するためです。
 *
 * 【恩恵】
 * - 実際の表示可能領域（ViewPort）の高さを `px` 単位で正確に計算し、
 *   CSS カスタムプロパティ `--app-height` として提供します。
 * - ウィンドウのリサイズイベントに追従するため、キーボードの表示や
 *   画面回転時にもレイアウトが崩れません。
 *
 * 【使用法】
 * `App.tsx` のルートで一度呼び出します。CSS 側では `height: var(--app-height);` のように参照します。
 */
export const useFullscreenHeight = () => {
  useEffect(() => {
    /**
     * 実際のビューポート高さの計算と適用
     * ブラウザのアドレスバーによる画面の隠れ・はみ出しを防ぐため、物理的な高さをCSS変数にセットするために必要です
     */
    const setAppHeight = () => {
      // document.documentElement は <html> タグを指す
      const doc = document.documentElement;
      // window.innerHeight はブラウザのUIを除いた実際の表示領域の高さ
      doc.style.setProperty("--app-height", `${window.innerHeight}px`);
    };

    // ウィンドウのリサイズ時にも高さを再計算する
    window.addEventListener("resize", setAppHeight);
    // マウント時に一度実行する
    setAppHeight();

    // クリーンアップ関数
    return () => {
      window.removeEventListener("resize", setAppHeight);
    };
  }, []);
};
