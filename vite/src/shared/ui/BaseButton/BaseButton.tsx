import styled from "styled-components";

/** 基礎となるアクションボタン */
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
  text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
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

/** ターン終了ボタン */
export const TurnEndButton = styled(BaseActionButton)`
  background: linear-gradient(145deg, #81c784, #4caf50);
`;

/** 召喚確定ボタン */
export const SummonButton = styled(BaseActionButton)`
  background: linear-gradient(145deg, #ffc107, #ff8f00);
  font-size: 1em;
`;

/** キャンセルボタン */
export const CancelButton = styled(BaseActionButton)`
  background: linear-gradient(145deg, #9e9e9e, #616161);
  font-size: 1em;
`;