import styled from "styled-components";

/**
 * アクションボタンのベーススタイル (BaseActionButton)
 *
 * 【動機】
 * ゲーム内の全てのクリック可能なインタラクションボタン（召喚、キャンセル、ターン終了など）
 * に対して、統一されたルック＆フィール（ゲームらしいリッチな見た目）を適用するためです。
 *
 * 【恩恵】
 * - `hover`, `active`, `disabled` 時の視覚フィードバック（浮き上がりや沈み込み）が
 *   スタイルとして定義されているため、個別のボタン実装時にデザインを意識する必要がありません。
 * - `styled-components` による拡張を前提としており、ベースの機能を維持したまま
 *   グラデーション色だけを変更するといったカスタマイズが容易です。
 *
 * 【使用法】
 * `styled(BaseActionButton)` として各機能の UI コンポーネントでラップして使用します。
 */
export const BaseActionButton = styled.button`
  flex-grow: 1;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 10px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease-in-out;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
  width: 100%;

  &:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(1px) scale(0.98);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    background: #757575;
    color: #bdbdbd;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
    opacity: 0.7;
  }
`;

export const ActionButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;
