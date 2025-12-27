import React from "react";
import { useUIStore } from "@/app/store/useUIStore";
import { useGameStore } from "@/app/store/useGameStore";
import {
  BaseActionButton,
  ActionButtonContainer,
} from "@/shared/components/BaseActionButton";
import styled from "styled-components";

const SummonButton = styled(BaseActionButton)`
  background: linear-gradient(145deg, #ffc107, #ff8f00);
  font-size: 1em;
`;

const CancelButton = styled(BaseActionButton)`
  background: linear-gradient(145deg, #9e9e9e, #616161);
  font-size: 1em;
`;

/**
 * カード使用決定UI（ActionButtons）
 * 
 * 【動機】
 * カード移動（プレビュー）の後に、「本当にここに使用するか」という
 * 最終的な決定をユーザーに行わせるためです。
 * ドラッグだけでは意図せぬ配置が起きやすいため、明示的な確認ボタンを提供します。
 *
 * 【恩恵】
 * - `useUIStore` と `useGameStore` の橋渡しを行い、プレビューされた座標を元に
 *   実際のストアアクションを実行します。
 * - エラーが発生した場合は `setNotification` を通じてユーザーに即座にフィードバックします。
 *
 * 【使用法】
 * `InteractionRegistry` を通じて、サイドパネルの特定スロットに自動的に注入されます。
 */
const ActionButtons: React.FC = () => {
  const { selectedCardId, previewPlacement, deselectCard, setNotification } =
    useUIStore();
  const { playCard, gameField, activePlayerId } = useGameStore();

  /**
   * 「召喚/実行」ボタンのクリックハンドラ
   * 現在のプレビュー位置（ターゲットマス）に対してカード効果を確定するために必要です
   */
  const handleSummon = () => {
    if (!selectedCardId || !previewPlacement) return;

    // 現在のプレビュー座標にあるセルを取得
    const targetCell = gameField.cells[previewPlacement.y][previewPlacement.x];
    
    // ゲームストアの playCard アクションを実行（バリデーション込み）
    const error = playCard(selectedCardId, targetCell);

    if (error) {
      // 配置不可などの理由がある場合は通知を表示
      setNotification(error, activePlayerId);
    } else {
      // 成功した場合は選択・プレビュー状態を解除
      deselectCard();
    }
  };

  return (
    <ActionButtonContainer>
      <SummonButton onClick={handleSummon}>召喚</SummonButton>
      <CancelButton onClick={deselectCard}>取消</CancelButton>
    </ActionButtonContainer>
  );
};

export default ActionButtons;
