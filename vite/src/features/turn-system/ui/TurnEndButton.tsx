import React from "react";
import styled from "styled-components";
import { useUIStore } from "@/app/store/useUIStore";
import { useGameStore } from "@/app/store/useGameStore";
import { BaseActionButton } from "@/shared/components/BaseActionButton";
import { PlayerType } from "@/shared/types/game-schema";

const StyledTurnEndButton = styled(BaseActionButton)`
  background: linear-gradient(145deg, #81c784, #4caf50);
`;

/**
 * ターン終了ボタン (TurnEndButton)
 * 
 * 【動機】
 * プレイヤーが自身の自由行動を終え、対戦相手に手番を渡すための
 * 明示的な操作インターフェースを提供するためです。
 *
 * 【恩恵】
 * - `isGameOver` や `activePlayerId` に基づいて自動的に `disabled` 状態になるため、
 *   不正なターン進行を UI レイヤーで防ぐことができます。
 * - 実行時に `deselectCard()` を自動的に呼び出すことで、選択状態のリセット漏れを防止します。
 *
 * 【使用法】
 * `turn-system/index.tsx` 内で `InteractionRegistry` を通じてサイドパネルに注入されます。
 */
interface TurnEndButtonProps {
  player: PlayerType;
}

const TurnEndButton: React.FC<TurnEndButtonProps> = ({ player }) => {
  const { progressTurn, isGameOver, activePlayerId } = useGameStore();
  const { deselectCard } = useUIStore();

  /**
   * ターン終了操作の実行
   * 選択中の情報をクリーンアップし、ストアにターン進行（交代）アクションを発行するために必要です
   */
  const handleTurnEnd = () => {
    deselectCard(); // カード選択中だった場合は解除しておく
    progressTurn(); // ターン進行ロジックの発火
  };

  // ゲーム終了後、あるいは相手のターンの時はボタンを無効化
  const isDisabled = isGameOver || activePlayerId !== player;

  return (
    <StyledTurnEndButton onClick={handleTurnEnd} disabled={isDisabled}>
      ターン終了
    </StyledTurnEndButton>
  );
};

export default TurnEndButton;
