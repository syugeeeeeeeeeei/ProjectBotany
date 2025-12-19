import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

/**
 * メインコンテナ
 * 画面下部に固定され、ヘッダーとログエリアを縦に並べる
 */
const ConsoleContainer = styled.div`
  position: fixed;
  bottom: 10px;
  left: 10px;
  width: calc(100% - 20px);
  max-width: 600px;
  height: 250px;
  background-color: rgba(20, 20, 20, 0.85);
  backdrop-filter: blur(4px);
  color: #0f0;
  font-family: 'Courier New', Courier, monospace;
  border: 1px solid #444;
  border-radius: 8px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`;

/**
 * コントロールヘッダー
 * ボタンを横並びに配置し、ログエリアから独立させる
 */
const ConsoleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background-color: rgba(45, 45, 45, 0.9);
  border-bottom: 1px solid #333;
`;

const HeaderTitle = styled.span`
  font-size: 10px;
  font-weight: bold;
  color: #aaa;
  letter-spacing: 1px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 6px;
`;

const ActionButton = styled.button`
  background: #444;
  color: #eee;
  border: 1px solid #666;
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #555;
    border-color: #888;
  }

  &:active {
    background: #333;
    transform: translateY(1px);
  }
`;

/**
 * ログ表示エリア
 * column-reverse により、配列の先頭（最新ログ）が一番下に表示される
 */
const LogList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse; 
  padding: 8px;
  gap: 2px;

  /* スクロールバーのカスタマイズ */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 3px;
  }
`;

const LogMessage = styled.div<{ type: string }>`
  white-space: pre-wrap;
  word-break: break-all;
  padding: 3px 0;
  font-size: 12px;
  line-height: 1.4;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: ${({ type }) => {
		switch (type) {
			case 'error': return '#ff5555';
			case 'warn': return '#ffb86c';
			case 'info': return '#8be9fd';
			default: return '#50fa7b';
		}
	}};

  &::before {
    content: '> ';
    opacity: 0.5;
  }
`;

const ShowButton = styled.button`
  position: fixed;
  bottom: 10px;
  left: 10px;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.7);
  color: #0f0;
  border: 1px solid #0f0;
  border-radius: 4px;
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
  font-family: 'Courier New', Courier, monospace;
`;

interface LogEntry {
	id: number;
	type: 'log' | 'error' | 'warn' | 'info';
	message: string;
}

export const OnScreenConsole: React.FC = () => {
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [isVisible, setIsVisible] = useState(true);

	const formatMessage = (args: any[]): string => {
		return args.map(arg => {
			if (typeof arg === 'object' && arg !== null) {
				try {
					return JSON.stringify(arg, null, 2);
				} catch (e) {
					return '[Unserializable Object]';
				}
			}
			return String(arg);
		}).join(' ');
	};

	useEffect(() => {
		const originalConsole = { ...console };

		const intercept = (type: LogEntry['type']) => (...args: any[]) => {
			originalConsole[type](...args);
			setLogs(prevLogs => [
				{ id: Date.now() + Math.random(), type, message: formatMessage(args) },
				...prevLogs
			]);
		};

		console.log = intercept('log');
		console.error = intercept('error');
		console.warn = intercept('warn');
		console.info = intercept('info');

		return () => {
			Object.assign(console, originalConsole);
		};
	}, []);

	if (!isVisible) {
		return (
			<ShowButton onClick={() => setIsVisible(true)}>
				TERMINAL: SHOW
			</ShowButton>
		);
	}

	return (
		<ConsoleContainer>
			<ConsoleHeader>
				<HeaderTitle>DEBUG CONSOLE</HeaderTitle>
				<ButtonGroup>
					<ActionButton onClick={() => setLogs([])}>Clear</ActionButton>
					<ActionButton onClick={() => setIsVisible(false)}>Hide</ActionButton>
				</ButtonGroup>
			</ConsoleHeader>
			<LogList>
				{/* column-reverse のため、map内の順序は変えずに最新が下に来る */}
				{logs.map(log => (
					<LogMessage key={log.id} type={log.type}>
						[{log.type.toUpperCase()}] {log.message}
					</LogMessage>
				))}
			</LogList>
		</ConsoleContainer>
	);
};