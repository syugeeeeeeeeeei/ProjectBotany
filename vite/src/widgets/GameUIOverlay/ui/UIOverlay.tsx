import React from 'react';
import styled from 'styled-components';

const OverlayWrapper = styled.div<{ $side: 'top' | 'bottom' }>`
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 100;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  text-align: center;
  
  ${props => props.$side === 'top' ? 'top: 0; transform: rotate(180deg);' : 'bottom: 0;'}
`;

const Message = styled.h1`
  font-size: 2.5rem;
  margin: 0;
  white-space: pre-line;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
`;

const SubMessage = styled.p`
  font-size: 1.5rem;
  margin-top: 10px;
`;

const DismissButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background: white;
  color: black;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  pointer-events: auto;
`;

interface UIOverlayProps {
	show: boolean;
	message: string;
	subMessage?: string;
	side: 'top' | 'bottom';
	buttonText?: string;
	onButtonClick?: () => void;
	isDismissible?: boolean;
	onDismiss?: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
	show, message, subMessage, side, buttonText, onButtonClick, isDismissible, onDismiss
}) => {
	if (!show) return null;

	return (
		<OverlayWrapper $side={side}>
			<Message>{message}</Message>
			{subMessage && <SubMessage>{subMessage}</SubMessage>}
			{buttonText && (
				<DismissButton onClick={(e) => { e.stopPropagation(); onButtonClick?.(); }}>
					{buttonText}
				</DismissButton>
			)}
			{isDismissible && (
				<DismissButton onClick={(e) => { e.stopPropagation(); onDismiss?.(); }}>
					閉じる
				</DismissButton>
			)}
		</OverlayWrapper>
	);
};