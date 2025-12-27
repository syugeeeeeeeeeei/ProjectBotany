import React, { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";

// --- 定数定義 ---

const ANIMATIONS = {
  APPEAR_DURATION: "0.2s",
  EXIT_DURATION: "0.5s",
  TIMING_FUNCTION: "ease-in-out",
};

const STYLES = {
  BACKGROUND_COLOR: "rgba(0, 0, 0, 0.8)",
  BORDER_TOP: "4px solid lightgray",
  Z_INDEX: 100,
  BUTTON_COLOR: "#4CAF50",
  BUTTON_HOVER_COLOR: "#45a049",
};

const FONT_SIZES = {
  small: "1.5em",
  medium: "2.0em",
  large: "2.5em",
};

const FONT_SIZE_THRESHOLDS = {
  small: 30,
  medium: 20,
};

// --- Keyframes ---

const quickAppear = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

// --- Styled Components ---

const OverlayContainer = styled.div<{
  $isExiting: boolean;
  side: "top" | "bottom";
}>`
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  box-sizing: border-box;
  border-top: ${STYLES.BORDER_TOP};

  ${({ side }) => (side === "top" ? "top: 0;" : "bottom: 0;")}
  ${({ side }) => side === "top" && "transform: rotate(180deg);"}

  background-color: ${STYLES.BACKGROUND_COLOR};
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: ${STYLES.Z_INDEX};
  font-family: sans-serif;
  text-align: center;
  white-space: pre-wrap;
  pointer-events: all;

  animation-name: ${({ $isExiting }) => ($isExiting ? fadeOut : quickAppear)};
  animation-duration: ${({ $isExiting }) =>
    $isExiting ? ANIMATIONS.EXIT_DURATION : ANIMATIONS.APPEAR_DURATION};
  animation-timing-function: ${ANIMATIONS.TIMING_FUNCTION};
  animation-fill-mode: forwards;
`;

const Message = styled.h2<{ $fontSize: string }>`
  font-size: ${({ $fontSize }) => $fontSize};
  margin: 0 20px;
  text-shadow: 0 0 10px #000;
`;

const SubMessage = styled.p`
  font-size: 1.3em;
  margin-top: 10px;
`;

const ActionButton = styled.button`
  margin-top: 30px;
  padding: 15px 30px;
  font-size: 1.2em;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background-color: ${STYLES.BUTTON_COLOR};
  color: white;
  transition: all 0.2s;

  &:hover {
    background-color: ${STYLES.BUTTON_HOVER_COLOR};
  }
`;

const ScoreContainer = styled.div`
  margin-top: 20px;
  font-size: 1.1em;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: rgba(80, 80, 80);
  padding: 10px 20px;
  border-radius: 8px;
`;

const ScoreRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 250px;
`;

// --- Component ---

/**
 * フルスクリーン・オーバーレイコンポーネント (UIOverlay)
 * 
 * 【動機】
 * ゲームのタイトル表示、ターンの切り替え通知、リザルト画面など、
 * ユーザーの注意を中央に集めたい情報を表示するためです。
 * また、対面プレイ（スマホを真ん中に置く形式）を想定し、
 * 上下のプレイヤーそれぞれに向けた情報の出し分け（回転表示など）をサポートします。
 *
 * 【恩恵】
 * - `styled-components` によるアニメーション（フェードイン・アウト）により、
 *   唐突な画面切り替えを避け、ユーザー体験を向上させます。
 * - メッセージの長さに応じてフォントサイズを自動調整（Dynamic Font Size）するため、
 *   はみ出しを防ぎつつ最適な視認性を確保します。
 * - `displayData` ステートを挟むことで、非表示アニメーション中の情報消失を防いでいます。
 *
 * 【使用法】
 * `App.tsx` 内で、表示したいメッセージやボタン、スコア情報を渡して配置します。
 * `side="top"` を指定すると 180 度回転して、対面にいる相手に向けた表示になります。
 */
interface UIOverlayProps {
  show: boolean;
  message: string;
  subMessage?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  side: "top" | "bottom";
  isDismissible?: boolean;
  onDismiss?: () => void;
  scoreInfo?: {
    native: number;
    alien: number;
    total: number;
  };
}

const UIOverlay: React.FC<UIOverlayProps> = ({
  show,
  message,
  subMessage,
  buttonText,
  onButtonClick,
  side,
  isDismissible,
  onDismiss,
  scoreInfo,
}) => {
  // マウント/アンマウントの制御ステート
  const [isRendered, setIsRendered] = useState(show);

  // 表示中の情報を固定するためのステート
  // これにより、消え始める瞬間にpropsが空になっても、フェードアウトが終わるまで表示を維持できる
  const [displayData, setDisplayData] = useState({
    message,
    subMessage,
    buttonText,
    scoreInfo,
  });

  /**
   * メッセージの長さに応じたフォントサイズの計算
   * 長文がパネルからはみ出すのを防ぎ、UIの整合性を保つために必要です
   */
  const fontSize = useMemo(() => {
    const len = displayData.message.length;
    if (len > FONT_SIZE_THRESHOLDS.small) return FONT_SIZES.small;
    if (len > FONT_SIZE_THRESHOLDS.medium) return FONT_SIZES.medium;
    return FONT_SIZES.large;
  }, [displayData.message]);

  /**
   * 表示切り替え時のエフェクト処理
   * propsの変更を内部ステートに同期させ、消去時の遅延アンマウントを制御するために必要です
   */
  useEffect(() => {
    if (show) {
      setIsRendered(true);
      // 表示中は常に最新の情報を反映
      setDisplayData({ message, subMessage, buttonText, scoreInfo });
    } else {
      // 非表示（フェードアウト開始）時は、コンポーネント消滅までタイマー待機
      const timer = setTimeout(
        () => setIsRendered(false),
        parseFloat(ANIMATIONS.EXIT_DURATION) * 1000,
      );
      return () => clearTimeout(timer);
    }
  }, [show, message, subMessage, buttonText, scoreInfo]);

  /**
   * コンテナ全体のクリックハンドラ
   * 背景タップによるオーバーレイの解除（Dismiss）機能を提供するために必要です
   */
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return; // 子要素（ボタンなど）のクリックは除外
    if (isDismissible && onDismiss) {
      onDismiss();
    }
  };

  if (!isRendered) {
    return null;
  }

  // 表示には内部ステート displayData を使用する
  return (
    <OverlayContainer
      $isExiting={!show}
      side={side}
      onClick={handleContainerClick}
    >
      <Message $fontSize={fontSize}>{displayData.message}</Message>
      {displayData.subMessage && (
        <SubMessage>{displayData.subMessage}</SubMessage>
      )}

      {displayData.scoreInfo && (
        <ScoreContainer>
          <ScoreRow>
            <span>在来種マス:</span>
            <span>
              {displayData.scoreInfo.native} / {displayData.scoreInfo.total}
            </span>
          </ScoreRow>
          <ScoreRow>
            <span>外来種マス:</span>
            <span>
              {displayData.scoreInfo.alien} / {displayData.scoreInfo.total}
            </span>
          </ScoreRow>
        </ScoreContainer>
      )}

      {displayData.buttonText && onButtonClick && (
        <ActionButton onClick={onButtonClick}>
          {displayData.buttonText}
        </ActionButton>
      )}
    </OverlayContainer>
  );
};

export default UIOverlay;
