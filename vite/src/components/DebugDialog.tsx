import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

// --- Styled Components --- (変更なし)
const DialogContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed; bottom: 75px; right: 20px; background-color: #1c1c1ee6;
  color: white; border: 1px solid #444; border-radius: 8px;
  padding: 16px; z-index: 1000; display: flex; flex-direction: column;
  gap: 15px; min-width: 280px; font-family: sans-serif;
  transform-origin: bottom right; opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transform: scale(${({ $isOpen }) => ($isOpen ? 1 : 0.95)});
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: all 0.2s ease-in-out;
`;
const ToggleButton = styled.button`
  position: fixed; bottom: 20px; right: 20px; z-index: 1001;
  padding: 8px 12px; border-radius: 5px; cursor: pointer;
`;
const Section = styled.div`
  display: flex; flex-direction: column; gap: 8px; border-top: 1px solid #333;
  padding-top: 10px; &:first-child { border-top: none; padding-top: 0; }
`;
const SectionTitle = styled.h4`
  margin: 0; color: #aaa; font-size: 0.9em; font-weight: normal;
`;
const ControlRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
`;
const SliderRow = styled.div`
  display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center;
`;
const PlayerControlsContainer = styled.div`
  display: flex; flex-direction: column; gap: 10px;
`;

// --- Component Definitions --- (変更なし)

type PlayerControlProps = {
	name: string; currentPage: number; maxPage: number;
	onNext: () => void; onPrev: () => void;
};

const PlayerControls: React.FC<PlayerControlProps> = ({ name, currentPage, maxPage, onNext, onPrev }) => (
	<ControlRow>
		<span>{name}</span>
		<div>
			<button onClick={onPrev} disabled={currentPage === 0}>◀</button>
			<span> {currentPage + 1} / {maxPage + 1} </span>
			<button onClick={onNext} disabled={currentPage === maxPage}>▶</button>
		</div>
	</ControlRow>
);

export type DebugSettings = {
	isGestureAreaVisible: boolean;
	flickDistanceRatio: number;
	flickVelocityThreshold: number;
	swipeAreaHeight: number;
};

interface DebugDialogProps {
	debugSettings: DebugSettings;
	onSetDebugSettings: (updater: (prev: DebugSettings) => DebugSettings) => void;
	cardMultiplier: number;
	onSetCardMultiplier: (updater: (prev: number) => number) => void;
	players: PlayerControlProps[];
	isAlienHandVisible: boolean;
	onToggleAlienHand: () => void;
	isNativeHandVisible: boolean;
	onToggleNativeHand: () => void;
}

export const DebugDialog: React.FC<DebugDialogProps> = ({
	debugSettings,
	onSetDebugSettings,
	cardMultiplier,
	onSetCardMultiplier,
	players,
	isAlienHandVisible,
	onToggleAlienHand,
	isNativeHandVisible,
	onToggleNativeHand,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	// ★追加: 全画面表示の状態を管理
	const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

	const {
		isGestureAreaVisible,
		flickDistanceRatio,
		flickVelocityThreshold,
		swipeAreaHeight
	} = debugSettings;

	// ★追加: 全画面表示を切り替える関数
	const handleToggleFullscreen = () => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen().catch(err => {
				alert(`全画面表示にできませんでした: ${err.message}`);
			});
		} else {
			document.exitFullscreen();
		}
	};

	// ★追加: 全画面状態の変更（例: Escキー押下）を監視してstateに反映
	useEffect(() => {
		const onFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener('fullscreenchange', onFullscreenChange);
		return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
	}, []);

	return (
		<>
			<ToggleButton onClick={() => setIsOpen(o => !o)}>
				{isOpen ? 'Close Debug' : 'Open Debug'}
			</ToggleButton>
			<DialogContainer $isOpen={isOpen}>
				{/* ★追加: 全画面表示ボタンを含むセクション */}
				<Section>
					<SectionTitle>一般設定</SectionTitle>
					<ControlRow>
						<label>全画面表示</label>
						<button onClick={handleToggleFullscreen}>
							{isFullscreen ? '終了する' : '開始する'}
						</button>
					</ControlRow>
				</Section>

				<Section>
					<SectionTitle>表示設定</SectionTitle>
					<ControlRow>
						<label htmlFor="toggle-gesture-area">ジェスチャーエリア表示</label>
						<input
							type="checkbox" id="toggle-gesture-area"
							checked={isGestureAreaVisible}
							onChange={() => onSetDebugSettings(s => ({ ...s, isGestureAreaVisible: !s.isGestureAreaVisible }))}
						/>
					</ControlRow>
					<ControlRow>
						<label htmlFor="toggle-alien-hand">エイリアン手札表示</label>
						<input
							type="checkbox" id="toggle-alien-hand"
							checked={isAlienHandVisible}
							onChange={onToggleAlienHand}
						/>
					</ControlRow>
					<ControlRow>
						<label htmlFor="toggle-native-hand">ネイティブ手札表示</label>
						<input
							type="checkbox" id="toggle-native-hand"
							checked={isNativeHandVisible}
							onChange={onToggleNativeHand}
						/>
					</ControlRow>
					<SliderRow>
						<label>スワイプエリアの高さ</label>
						<span>{swipeAreaHeight.toFixed(1)}</span>
						<input
							type="range" min="1" max="10" step="0.5"
							value={swipeAreaHeight}
							onChange={(e) => onSetDebugSettings(s => ({ ...s, swipeAreaHeight: parseFloat(e.target.value) }))}
							style={{ gridColumn: '1 / -1' }}
						/>
					</SliderRow>
				</Section>
				<Section>
					<SectionTitle>ジェスチャー感度</SectionTitle>
					<SliderRow>
						<label>距離の比率 (小さいほど敏感)</label>
						<span>{flickDistanceRatio.toFixed(2)}</span>
						<input
							type="range" min="0.1" max="0.8" step="0.05"
							value={flickDistanceRatio}
							onChange={(e) => onSetDebugSettings(s => ({ ...s, flickDistanceRatio: parseFloat(e.target.value) }))}
							style={{ gridColumn: '1 / -1' }}
						/>
					</SliderRow>
					<SliderRow>
						<label>速度のしきい値 (小さいほど敏感)</label>
						<span>{flickVelocityThreshold.toFixed(2)}</span>
						<input
							type="range" min="0.1" max="1.5" step="0.05"
							value={flickVelocityThreshold}
							onChange={(e) => onSetDebugSettings(s => ({ ...s, flickVelocityThreshold: parseFloat(e.target.value) }))}
							style={{ gridColumn: '1 / -1' }}
						/>
					</SliderRow>
				</Section>
				<Section>
					<SectionTitle>カード設定</SectionTitle>
					<ControlRow>
						<span>カード枚数倍率</span>
						<div>
							<button onClick={() => onSetCardMultiplier(m => Math.max(1, m - 1))}>-</button>
							<span> x{cardMultiplier} </span>
							<button onClick={() => onSetCardMultiplier(m => m + 1)}>+</button>
						</div>
					</ControlRow>
				</Section>
				<Section>
					<SectionTitle>手札ページ操作</SectionTitle>
					<PlayerControlsContainer>
						{players.map(p => <PlayerControls key={p.name} {...p} />)}
					</PlayerControlsContainer>
				</Section>
			</DialogContainer>
		</>
	);
};