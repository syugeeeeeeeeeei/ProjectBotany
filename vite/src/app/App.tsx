import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

// Shared
import { DebugDialog, type DebugSettings } from '../shared/components/debug/DebugDialog';
import SceneController from '../shared/components/3d/SceneController';
import type { CardDefinition, PlayerType } from '../shared/types/game-schema';
import { useFullscreenHeight } from '../shared/hooks/useFullscreenHeight';

// Features (Public API via Index)
import { GameBoard3D } from '../features/field-grid';
import { Hand3D } from '../features/card-hand';
import { GameInfo, UIOverlay } from '../features/hud';
import { ActionButtons } from '../features/play-card';
import { TurnEndButton } from '../features/turn-system';

// Data & Stores
import cardMasterData from '../data/cardMasterData';
import { useGameStore } from './store/useGameStore';
import { useUIStore } from './store/useUIStore';

const GLOBAL_STYLES = { BACKGROUND_COLOR: '#50342b' };
const LAYOUT = { SIDE_PANEL_WIDTH: '120px', SIDE_PANEL_GAP: '20px', SIDE_PANEL_OFFSET: '5px' };
const CAMERA_SETTINGS = { POSITION: [0, 15, 14] as [number, number, number], FOV: 70 };
const LIGHT_SETTINGS = { AMBIENT_INTENSITY: 0.8, DIRECTIONAL_POSITION: [10, 10, 5] as [number, number, number], DIRECTIONAL_INTENSITY: 1 };
const TIMERS = { TURN_BANNER_DELAY: 1000, TURN_BANNER_DURATION: 2000, NOTIFICATION_DURATION: 3000 };
const HAND_PAGING = { CARDS_PER_PAGE: 3 };

const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0; padding: 0; width: 100%; height: 100vh;
    overflow: hidden; background-color: ${GLOBAL_STYLES.BACKGROUND_COLOR};
    overscroll-behavior: none;
  }
  #root { width: 100%; height: 100%; }
  body { user-select: none; -webkit-user-select: none; }
`;

const MainContainer = styled.div`
  width: 100%; height: 100%; position: relative; pointer-events: none;
`;

const CanvasContainer = styled.div`
  width: 100%; height: 100%; position: absolute; top: 0; left: 0; pointer-events: auto;
`;

const SidePanel = styled.div`
  position: absolute; top: 50%; transform: translateY(-50%);
  width: ${LAYOUT.SIDE_PANEL_WIDTH}; display: flex; flex-direction: column;
  align-items: center; gap: ${LAYOUT.SIDE_PANEL_GAP}; color: white;
  pointer-events: auto; z-index: 10; font-family: sans-serif;

  &.left {
    left: ${LAYOUT.SIDE_PANEL_OFFSET};
    & > .content { display: flex; flex-direction: column; align-items: center; gap: 10px; transform: rotate(180deg); }
  }
  &.right {
    right: ${LAYOUT.SIDE_PANEL_OFFSET};
    & > .content { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  }
`;

const ScreenLockOverlay = styled.div`
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 999;
`;

function App() {
	useFullscreenHeight();
	const game = useGameStore();
	const ui = useUIStore();

	const [isGameStarted, setIsGameStarted] = useState(false);
	const [showTurnBanner, setShowTurnBanner] = useState(false);
	const [isStartingTurn, setIsStartingTurn] = useState(false);
	const [isAlienHandManuallyVisible, setAlienHandManuallyVisible] = useState(true);
	const [isNativeHandManuallyVisible, setNativeHandManuallyVisible] = useState(true);
	const [alienHandPage, setAlienHandPage] = useState(0);
	const [nativeHandPage, setNativeHandPage] = useState(0);

	const [debugSettings, setDebugSettings] = useState<DebugSettings>({
		isGestureAreaVisible: false, flickDistanceRatio: 0.25, flickVelocityThreshold: 0.2, swipeAreaHeight: 4,
	});

	useEffect(() => {
		if (!isGameStarted || game.isGameOver) return;
		setIsStartingTurn(true);
		const timer = setTimeout(() => {
			setShowTurnBanner(true);
			setIsStartingTurn(false);
		}, TIMERS.TURN_BANNER_DELAY);
		return () => clearTimeout(timer);
	}, [game.activePlayerId, game.currentTurn, isGameStarted, game.isGameOver]);

	useEffect(() => {
		if (showTurnBanner) {
			const timer = setTimeout(() => { setShowTurnBanner(false); }, TIMERS.TURN_BANNER_DURATION);
			return () => clearTimeout(timer);
		}
	}, [showTurnBanner]);

	useEffect(() => {
		if (ui.notification) {
			const timer = setTimeout(() => ui.setNotification(null), TIMERS.NOTIFICATION_DURATION);
			return () => clearTimeout(timer);
		}
	}, [ui.notification]);

	const { alienCards, nativeCards } = useMemo(() => {
		const duplicate = (cards: CardDefinition[]) => cards.flatMap(card =>
			Array.from({ length: card.deckCount }).map((_, i) => ({
				...card, instanceId: `${card.id}-instance-${i}`
			}))
		);
		const alien = duplicate(cardMasterData.filter(c => c.cardType === 'alien')).sort((a, b) => a.cost - b.cost);
		const native = [
			...duplicate(cardMasterData.filter(c => c.cardType === 'eradication')),
			...duplicate(cardMasterData.filter(c => c.cardType === 'recovery'))
		].sort((a, b) => a.cost - b.cost);
		return { alienCards: alien, nativeCards: native };
	}, []);

	const getOverlayProps = (thisPlayerId: PlayerType) => {
		if (!isGameStarted) return { show: true, message: 'Project Botany', buttonText: 'Start Game', onButtonClick: () => setIsGameStarted(true) };
		if (game.isGameOver) {
			const sub = game.winningPlayerId === thisPlayerId ? 'あなたの勝利！' : game.winningPlayerId === null ? '引き分け' : 'あなたの敗北';
			return { show: true, message: 'Game Over', subMessage: sub, buttonText: 'Play Again', onButtonClick: () => { game.resetGame(); setIsGameStarted(true); } };
		}
		if (showTurnBanner) {
			const role = game.activePlayerId === thisPlayerId ? '(あなた)' : '(あいて)';
			return { show: true, message: `Turn ${game.currentTurn}/${game.maximumTurns}\n${game.playerStates[game.activePlayerId].playerName} ${role} のターン` };
		}
		if (ui.notification && ui.notification.forPlayer === thisPlayerId) return { show: true, message: ui.notification.message, isDismissible: true };
		return { show: false, message: '' };
	};

	const isSelecting = !!(ui.selectedCardId || ui.selectedAlienInstanceId);
	const isAlienHandActuallyVisible = isAlienHandManuallyVisible && game.activePlayerId === 'alien' && !isSelecting;
	const isNativeHandActuallyVisible = isNativeHandManuallyVisible && game.activePlayerId === 'native' && !isSelecting;

	return (
		<>
			<GlobalStyle />
			{isStartingTurn && <ScreenLockOverlay />}

			<MainContainer>
				<UIOverlay {...getOverlayProps('alien')} side="bottom" onDismiss={() => ui.setNotification(null)} />
				<UIOverlay {...getOverlayProps('native')} side="top" onDismiss={() => ui.setNotification(null)} />

				<CanvasContainer>
					<Canvas shadows camera={{ position: CAMERA_SETTINGS.POSITION, fov: CAMERA_SETTINGS.FOV }}>
						<color attach="background" args={[GLOBAL_STYLES.BACKGROUND_COLOR]} />
						<ambientLight intensity={LIGHT_SETTINGS.AMBIENT_INTENSITY} />
						<directionalLight position={LIGHT_SETTINGS.DIRECTIONAL_POSITION} intensity={LIGHT_SETTINGS.DIRECTIONAL_INTENSITY} />
						<GameBoard3D fieldState={game.gameField} />
						<Hand3D player="alien" cards={alienCards} isVisible={isAlienHandActuallyVisible} onVisibilityChange={setAlienHandManuallyVisible} currentPage={alienHandPage} onPageChange={setAlienHandPage} debugSettings={debugSettings} isInteractionLocked={isSelecting} />
						<Hand3D player="native" cards={nativeCards} isVisible={isNativeHandActuallyVisible} onVisibilityChange={setNativeHandManuallyVisible} currentPage={nativeHandPage} onPageChange={setNativeHandPage} debugSettings={debugSettings} isInteractionLocked={isSelecting} />
						<OrbitControls makeDefault enableZoom={false} enableRotate={false} enablePan={false} />
						<SceneController />
					</Canvas>
				</CanvasContainer>

				<SidePanel className="right">
					<div className="content">
						<GameInfo player="alien" />
						{ui.isCardPreview && game.activePlayerId === 'alien' ? <ActionButtons /> : <TurnEndButton player="alien" />}
					</div>
				</SidePanel>

				<SidePanel className="left">
					<div className="content">
						<GameInfo player="native" />
						{ui.isCardPreview && game.activePlayerId === 'native' ? <ActionButtons /> : <TurnEndButton player="native" />}
					</div>
				</SidePanel>
			</MainContainer>
		</>
	);
}

export default App;