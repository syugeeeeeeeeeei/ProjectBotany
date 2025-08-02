import { OrbitControls, Stage } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { DebugDialog, type DebugSettings } from './components/DebugDialog';
import GameBoard3D from './components/GameBoard3D';
import GameInfo from './components/GameInfo';
import Hand3D from './components/Hand3D';
import SceneController from './components/SceneController';
import UIOverlay from './components/UIOverlay';
import { cardMasterData, useGameStore } from './store/gameStore';
import type { PlayerId } from './types/data';

const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0; padding: 0; width: 100%; height:100%;
    overflow: hidden; background-color: #50342bff;
  }
  #root { width: 100%; height: 100%; }
  body { user-select: none; -webkit-user-select: none; }
`;

const MainContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  pointer-events: none;
  overscroll-behavior: none;
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: auto;
`;

const SidePanel = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 120px;
  // padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: white;
  pointer-events: auto;
  z-index: 10;
  font-family: sans-serif;

  &.left {
    left: 5px;
    & > .content {
      display: flex; flex-direction: column;
      align-items: center; gap: 10px;
      transform: rotate(180deg);
    }
  }
  &.right { 
    right: 5px; 
    & > .content {
      display: flex; flex-direction: column;
      align-items: center; gap: 10px;
    }
  }
`;

const DebugContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 200;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

// ★追加: 画面全体を覆うロック用のオーバーレイ
const ScreenLockOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999; /* 最前面に表示して全てをブロック */
  background-color: transparent; /* 見た目は透明 */
`;

// ★追加: ターン終了ボタンのスタイル
const TurnEndButton = styled.button`
  background: linear-gradient(145deg, #81c784, #4caf50);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 15px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease-in-out;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
  width: 100%; /* 親要素の幅に合わせる */

  &:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(1px) scale(0.98);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    background: #757575; /* グレーアウト */
    color: #bdbdbd;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
    opacity: 0.7;
  }
`;

function App() {
  const store = useGameStore();
  // ★修正: selectedAlienInstanceId を追加
  const { selectedCardId, selectedAlienInstanceId, notification, setNotification, resetGame } = store;

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showTurnBanner, setShowTurnBanner] = useState(false);
  const [isStartingTurn, setIsStartingTurn] = useState(false);

  const [multiplier, setMultiplier] = useState(1);
  const [alienHandPage, setAlienHandPage] = useState(0);
  const [nativeHandPage, setNativeHandPage] = useState(0);
  const [isAlienHandVisible, setAlienHandVisible] = useState(true);
  const [isNativeHandVisible, setNativeHandVisible] = useState(true);
  const [handResetKey, setHandResetKey] = useState(0);
  const handVisibilityBeforeSelect = useRef({ alien: true, native: true });
  const [debugSettings, setDebugSettings] = useState<DebugSettings>({
    isGestureAreaVisible: false,
    flickDistanceRatio: 0.25,
    flickVelocityThreshold: 0.2,
    swipeAreaHeight: 3.5,
  });

  // ★修正: カードまたはコマ選択時に手札を非表示にする
  useEffect(() => {
    if (selectedCardId || selectedAlienInstanceId) {
      handVisibilityBeforeSelect.current = { alien: isAlienHandVisible, native: isNativeHandVisible };
      setAlienHandVisible(false);
      setNativeHandVisible(false);
    } else {
      setAlienHandVisible(handVisibilityBeforeSelect.current.alien);
      setNativeHandVisible(handVisibilityBeforeSelect.current.native);
    }
  }, [selectedCardId, selectedAlienInstanceId]);

  useEffect(() => {
    const forceRemount = () => setHandResetKey(k => k + 1);
    document.addEventListener('visibilitychange', forceRemount);
    window.addEventListener('pageshow', forceRemount);
    return () => {
      document.removeEventListener('visibilitychange', forceRemount);
      window.removeEventListener('pageshow', forceRemount);
    };
  }, []);

  useEffect(() => {
    if (!isGameStarted || store.isGameOver) return;
    setIsStartingTurn(true);
    const timer = setTimeout(() => {
      setShowTurnBanner(true);
      setIsStartingTurn(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [store.activePlayerId, store.currentTurn, isGameStarted, store.isGameOver]);

  useEffect(() => {
    if (showTurnBanner) {
      const timer = setTimeout(() => { setShowTurnBanner(false); }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showTurnBanner]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);

  const { alienCards, nativeCards } = useMemo(() => {
    const generateDummyCards = (type: 'alien' | 'native') => {
      const baseCards = cardMasterData.filter(c => type === 'alien' ? c.cardType === 'alien' : c.cardType !== 'alien');
      return Array.from({ length: multiplier }).flatMap((_, i) => baseCards.map(card => ({ ...card, instanceId: `${card.id}-instance-${i}` })));
    };
    return { alienCards: generateDummyCards('alien'), nativeCards: generateDummyCards('native') };
  }, [multiplier]);


  const getOverlayProps = (thisPlayerId: PlayerId) => {
    const { isGameOver, winningPlayerId, activePlayerId, currentTurn, playerStates } = store;
    const isMyTurn = activePlayerId === thisPlayerId;

    if (!isGameStarted) {
      return {
        show: true,
        message: 'Project Botany',
        buttonText: 'Start Game',
        onButtonClick: () => {
          setIsGameStarted(true);
        }
      };
    }
    if (isGameOver) {
      let resultText = '';
      if (winningPlayerId === thisPlayerId) resultText = 'あなたの勝利！';
      else if (winningPlayerId === null) resultText = '引き分け';
      else resultText = 'あなたの敗北';
      return { show: true, message: 'Game Over', subMessage: resultText, buttonText: 'Play Again', onButtonClick: () => { resetGame(); setIsGameStarted(true); } };
    }
    if (showTurnBanner) {
      const role = isMyTurn ? '(あなた)' : '(あいて)';
      const message = `Turn ${currentTurn}/${store.maximumTurns}\n${playerStates[activePlayerId].playerName} ${role} のターン`;
      return { show: true, message };
    }
    if (notification && notification.forPlayer === thisPlayerId) {
      return { show: true, message: notification.message, isDismissible: true };
    }
    return { show: false, message: '' };
  };

  const alienOverlayProps = getOverlayProps('alien_side');
  const nativeOverlayProps = getOverlayProps('native_side');

  const createPageHandlers = (
    page: number,
    setPage: React.Dispatch<React.SetStateAction<number>>,
    cardsLength: number
  ) => {
    const maxPage = Math.ceil(cardsLength / 4) - 1;
    return {
      handleNext: () => setPage(p => Math.min(p + 1, maxPage)),
      handlePrev: () => setPage(p => Math.max(p - 1, 0)),
      maxPage
    };
  };

  const alienPageHandlers = createPageHandlers(alienHandPage, setAlienHandPage, alienCards.length);
  const nativePageHandlers = createPageHandlers(nativeHandPage, setNativeHandPage, nativeCards.length);

  const onToggleAlienHand = () => {
    const newVisibility = !isAlienHandVisible;
    setAlienHandVisible(newVisibility);
    handVisibilityBeforeSelect.current.alien = newVisibility;
  };

  const onToggleNativeHand = () => {
    const newVisibility = !isNativeHandVisible;
    setNativeHandVisible(newVisibility);
    handVisibilityBeforeSelect.current.native = newVisibility;
  };


  const debugDialogProps = {
    debugSettings: debugSettings,
    onSetDebugSettings: setDebugSettings,
    cardMultiplier: multiplier,
    onSetCardMultiplier: setMultiplier,
    players:
      [
        { name: 'Alien Side', currentPage: alienHandPage, maxPage: alienPageHandlers.maxPage, onNext: alienPageHandlers.handleNext, onPrev: alienPageHandlers.handlePrev },
        { name: 'Native Side', currentPage: nativeHandPage, maxPage: nativePageHandlers.maxPage, onNext: nativePageHandlers.handleNext, onPrev: nativePageHandlers.handlePrev },
      ],
    isAlienHandVisible: isAlienHandVisible,
    onToggleAlienHand: onToggleAlienHand,
    isNativeHandVisible: isNativeHandVisible,
    onToggleNativeHand: onToggleNativeHand,
  }

  // ★修正: isInteractionLockedの条件にselectedAlienInstanceIdを追加
  const isHandInteractionLocked = !!selectedCardId || !!selectedAlienInstanceId;

  return (
    <>
      <GlobalStyle />
      {/* ★追加: isStartingTurnがtrueの間、画面全体をロック */}
      {isStartingTurn && <ScreenLockOverlay />}

      <DebugContainer>
        <DebugDialog {...debugDialogProps} />
      </DebugContainer>

      <MainContainer>
        <UIOverlay
          {...alienOverlayProps}
          side="bottom"
          onDismiss={alienOverlayProps.isDismissible ? () => setNotification(null) : undefined}
        />
        <UIOverlay
          {...nativeOverlayProps}
          side="top"
          onDismiss={nativeOverlayProps.isDismissible ? () => setNotification(null) : undefined}
        />

        <CanvasContainer>
          <Canvas shadows camera={{ position: [0, 15, 14], fov: 70 }}>
            <color attach="background" args={['#5d4037']} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <GameBoard3D fieldState={store.gameField} />
            <Hand3D key={`alien-hand-${handResetKey}`} player="alien_side" cards={alienCards} isVisible={store.activePlayerId === 'alien_side' && isAlienHandVisible} onVisibilityChange={setAlienHandVisible} currentPage={alienHandPage} onPageChange={setAlienHandPage} debugSettings={debugSettings} isInteractionLocked={isHandInteractionLocked} />
            <Hand3D key={`native-hand-${handResetKey}`} player="native_side" cards={nativeCards} isVisible={store.activePlayerId === 'native_side' && isNativeHandVisible} onVisibilityChange={setNativeHandVisible} currentPage={nativeHandPage} onPageChange={setNativeHandPage} debugSettings={debugSettings} isInteractionLocked={isHandInteractionLocked} />
            <OrbitControls makeDefault enableZoom={false} enableRotate={false} enablePan={false} />
            <SceneController />
          </Canvas>
        </CanvasContainer>

        <SidePanel className="right">
          <div className="content">
            <GameInfo player="alien_side" />
            <TurnEndButton onClick={store.progressTurn} disabled={store.isGameOver || store.activePlayerId !== 'alien_side'}>
              ターン終了
            </TurnEndButton>
          </div>
        </SidePanel>
        <SidePanel className="left">
          <div className="content">
            <GameInfo player="native_side" />
            <TurnEndButton onClick={store.progressTurn} disabled={store.isGameOver || store.activePlayerId !== 'native_side'}>
              ターン終了
            </TurnEndButton>
          </div>
        </SidePanel>
      </MainContainer>
    </>
  );
}

export default App;