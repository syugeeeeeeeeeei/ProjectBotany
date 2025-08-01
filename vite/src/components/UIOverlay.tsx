import React, { useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';

const quickAppear = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const OverlayContainer = styled.div<{ $isExiting: boolean; side: 'top' | 'bottom' }>`
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  
  /* ★修正: ご指定のスタイルに更新 */
  border-top: 4px solid lightgray;
  box-sizing: border-box;

  ${({ side }) => side === 'top' ? 'top: 0;' : 'bottom: 0;'}
  ${({ side }) => side === 'top' && 'transform: rotate(180deg);'}

  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 100;
  font-family: sans-serif;
  text-align: center;
  white-space: pre-wrap;
  pointer-events: all;
  
  animation-name: ${({ $isExiting }) => ($isExiting ? fadeOut : quickAppear)};
  animation-duration: ${({ $isExiting }) => ($isExiting ? '0.5s' : '0.2s')};
  animation-timing-function: ease-in-out;
  animation-fill-mode: forwards;
`;

// ★修正: フォントサイズを動的に受け取るように変更
const Message = styled.h2<{ $fontSize: string }>`
  font-size: ${({ $fontSize }) => $fontSize};
  margin: 0 20px; /* 左右に余白を追加 */
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
  background-color: #4CAF50;
  color: white;
  transition: all 0.2s;

  &:hover {
    background-color: #45a049;
  }
`;

// ★修正: PropsにisDismissibleとonDismissを追加
interface UIOverlayProps {
	show: boolean;
	message: string;
	subMessage?: string;
	buttonText?: string;
	onButtonClick?: () => void;
	side: 'top' | 'bottom';
	isDismissible?: boolean;
	onDismiss?: () => void;
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
}) => {
	const [isRendered, setIsRendered] = React.useState(show);

	// ★追加: 文字数に応じてフォントサイズを計算
	const fontSize = useMemo(() => {
		const len = message.length;
		if (len > 30) return '1.5em';
		if (len > 20) return '2.0em';
		return '2.5em';
	}, [message]);

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (show) {
			setIsRendered(true);
		} else {
			timer = setTimeout(() => setIsRendered(false), 500);
		}
		return () => clearTimeout(timer);
	}, [show]);

	if (!isRendered) {
		return null;
	}

	// ★追加: タップで即時終了するためのハンドラ
	const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
		// ボタン自身がクリックされた場合は、コンテナのクリックイベントを発火させない
		if (e.target !== e.currentTarget) return;

		if (isDismissible && onDismiss) {
			onDismiss();
		}
	};

	return (
		<OverlayContainer $isExiting={!show} side={side} onClick={handleContainerClick}>
			<Message $fontSize={fontSize}>{message}</Message>
			{subMessage && <SubMessage>{subMessage}</SubMessage>}
			{buttonText && onButtonClick && (
				<ActionButton onClick={onButtonClick}>
					{buttonText}
				</ActionButton>
			)}
		</OverlayContainer>
	);
};

export default UIOverlay;