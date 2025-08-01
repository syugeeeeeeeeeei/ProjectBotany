import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { type DebugSettings } from './components/DebugDialog';
import GameBoard3D from './components/GameBoard3D';
import GameInfo from './components/GameInfo';
import Hand3D from './components/Hand3D';
import SceneController from './components/SceneController';
import UIOverlay from './components/UIOverlay';
import { alienMaster, nativeMaster } from './constants/game';
import { useGameStore } from './store/gameStore';
import { useUIStore } from './store/uiStore'; // ★UIストアをインポート
import type { PlayerId } from './types/data';

// ... (styled-componentsの定義は変更なし)
const GlobalStyle = createGlobalStyle`
  html, body { margin: 0; padding: 0; width: 100%; height:100%; overflow: hidden; background-color: #50342bff; }
  #root { width: 100%; height: 100%; }
  body { user-select: none; -webkit-user-select: none; }
`;
const MainContainer = styled.div` width: 100%; height: 100%; position: relative; pointer-events: none; overscroll-behavior: none; `;
const CanvasContainer = styled.div` width: 100%; height: 100%; position: absolute; top: 0; left: 0; pointer-events: auto; `;
const SidePanel = styled.div` position: absolute; top: 50%; transform: translateY(-50%); width: 120px; display: flex; flex-direction: column; align-items: center; gap: 20px; color: white; pointer-events: auto; z-index: 10; font-family: sans-serif; &.left { left: 5px; & > .content { display: flex; flex-direction: column; align-items: center; gap: 10px; transform: rotate(180deg); } } &.right { right: 5px; & > .content { display: flex; flex-direction: column; align-items: center; gap: 10px; } } `;
const TurnEndButton = styled.button` background: linear-gradient(145deg, #81c784, #4caf50); color: white; border: none; border-radius: 12px; padding: 12px 15px; font-size: 1.2em; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); transition: all 0.2s ease-in-out; text-shadow: 1px 1px 2px rgba(0,0,0,0.4); width: 100%; &:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3); transform: translateY(-2px); } &:disabled { background: #757575; color: #bdbdbd; cursor: not-allowed; box-shadow: none; transform: none; opacity: 0.7; } `;


function App() {
  // --- storeから状態とアクションを取得 ---
  const { turn, currentPlayerId, gameStatus, winner, endTurn } = useGameStore();
  const {
    selectedCardId,
    isAlienHandVisible,
    isNativeHandVisible,
    setAlienHandVisible,
    setNativeHandVisible,
  } = useUIStore();

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showTurnBanner, setShowTurnBanner] = useState(false);
  const [alienHandPage, setAlienHandPage] = useState(0);
  const [nativeHandPage, setNativeHandPage] = useState(0);
  const [debugSettings, setDebugSettings] = useState<DebugSettings>({
    isGestureAreaVisible: false,
    flickDistanceRatio: 0.25,
    flickVelocityThreshold: 0.2,
    swipeAreaHeight: 3.5,
  });

  const handVisibilityBeforeSelect = useRef({ alien: true, native: true });

  // ★カード選択時に手札を非表示にするロジックを更新
  useEffect(() => {
    if (selectedCardId) {
      handVisibilityBeforeSelect.current = {
        alien: isAlienHandVisible,
        native: isNativeHandVisible,
      };
      setAlienHandVisible(false);
      setNativeHandVisible(false);
    } else {
      setAlienHandVisible(handVisibilityBeforeSelect.current.alien);
      setNativeHandVisible(handVisibilityBeforeSelect.current.native);
    }
  }, [selectedCardId, isAlienHandVisible, isNativeHandVisible, setAlienHandVisible, setNativeHandVisible]);


  useEffect(() => {
    if (!isGameStarted || gameStatus === 'ended') return;
    setShowTurnBanner(true);
  }, [currentPlayerId, turn, isGameStarted, gameStatus]);

  useEffect(() => {
    if (showTurnBanner) {
      const timer = setTimeout(() => {
        setShowTurnBanner(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showTurnBanner]);

  const { alienCards, nativeCards } = useMemo(() => ({
    alienCards: Object.values(alienMaster),
    nativeCards: Object.values(nativeMaster),
  }), []);

  const getOverlayProps = (thisPlayerId: PlayerId) => {
    const isMyTurn = currentPlayerId === thisPlayerId;
    if (!isGameStarted) {
      return { show: true, message: 'Project Botany', buttonText: 'Start Game', onButtonClick: () => setIsGameStarted(true) };
    }
    if (gameStatus === 'ended') {
      const resultText = winner === thisPlayerId ? 'あなたの勝利！' : winner === 'draw' ? '引き分け' : 'あなたの敗北';
      return { show: true, message: 'Game Over', subMessage: resultText, buttonText: 'Play Again', onButtonClick: () => { /* TODO: resetGame */ setIsGameStarted(true); } };
    }
    if (showTurnBanner) {
      const role = isMyTurn ? '(あなた)' : '(あいて)';
      return { show: true, message: `Turn ${turn}\n${currentPlayerId.toUpperCase()} ${role} のターン` };
    }
    return { show: false, message: '' };
  };

  const alienOverlayProps = getOverlayProps('alien');
  const nativeOverlayProps = getOverlayProps('native');

  const isHandInteractionLocked = !!selectedCardId;

  return (
    <>
      <GlobalStyle />
      <MainContainer>
        <UIOverlay {...alienOverlayProps} side="bottom" />
        <UIOverlay {...nativeOverlayProps} side="top" />

        <CanvasContainer>
          <Canvas camera={{ position: [0, 8, 7], fov: 60 }}>
            <color attach="background" args={['#5d4037']} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <GameBoard3D />
            <Hand3D player="alien" cards={alienCards} isVisible={isAlienHandVisible} onVisibilityChange={setAlienHandVisible} currentPage={alienHandPage} onPageChange={setAlienHandPage} debugSettings={debugSettings} isInteractionLocked={isHandInteractionLocked} />
            <Hand3D player="native" cards={nativeCards} isVisible={isNativeHandVisible} onVisibilityChange={setNativeHandVisible} currentPage={nativeHandPage} onPageChange={setNativeHandPage} debugSettings={debugSettings} isInteractionLocked={isHandInteractionLocked} />
            <OrbitControls makeDefault enableZoom={true} enableRotate={true} enablePan={true} />
            <SceneController />
          </Canvas>
        </CanvasContainer>

        <SidePanel className="right">
          <div className="content">
            <GameInfo player="alien" />
            <TurnEndButton onClick={endTurn} disabled={gameStatus !== 'player_turn' || currentPlayerId !== 'alien'}>
              ターン終了
            </TurnEndButton>
          </div>
        </SidePanel>
        <SidePanel className="left">
          <div className="content">
            <GameInfo player="native" />
            <TurnEndButton onClick={endTurn} disabled={gameStatus !== 'player_turn' || currentPlayerId !== 'native'}>
              ターン終了
            </TurnEndButton>

          </div>
        </SidePanel>
      </MainContainer>
    </>
  );
}

export default App;