import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { DebugDialog, type DebugSettings } from './components/DebugDialog'; // ✨ 型をインポート
import GameBoard3D from './components/GameBoard3D';
import GameInfo from './components/GameInfo';
import Hand3D from './components/Hand3D';
import SceneController from './components/SceneController';
import { cardMasterData, useGameStore } from './store/gameStore';

const MainContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const SidePanel = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 250px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background-color: #00000050;
  color: white;
  border-radius: 10px;
  pointer-events: auto;
  z-index: 10;

  &.left {
    left: 20px;
    & > * {
      transform: rotate(180deg);
    }
  }
  &.right {
    right: 20px;
  }
`;

const GameOverScreen = styled.div`
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.8); color: white;
  display: flex; justify-content: center; align-items: center;
  flex-direction: column; font-size: 2em; z-index: 100;
`;

function App() {
  const store = useGameStore();

  const [multiplier, setMultiplier] = useState(1);
  const [alienHandPage, setAlienHandPage] = useState(0);
  const [nativeHandPage, setNativeHandPage] = useState(0);
  const [isAlienHandVisible, setAlienHandVisible] = useState(true);
  const [isNativeHandVisible, setNativeHandVisible] = useState(true);

  // ✨ デバッグ設定をオブジェクトで一元管理
  const [debugSettings, setDebugSettings] = useState<DebugSettings>({
    isGestureAreaVisible: true,
    flickDistanceRatio: 0.25,
    flickVelocityThreshold: 0.2,
    swipeAreaHeight: 4,
  });


  const { alienCards, nativeCards } = useMemo(() => {
    const generateDummyCards = (type: 'alien' | 'native') => {
      const baseCards = cardMasterData.filter(
        c => type === 'alien' ? c.cardType === 'alien' : c.cardType !== 'alien'
      );
      return Array.from({ length: multiplier }).flatMap((_, i) =>
        baseCards.map(card => ({
          ...card,
          instanceId: `${card.id}-instance-${i}`
        }))
      );
    };
    return {
      alienCards: generateDummyCards('alien'),
      nativeCards: generateDummyCards('native'),
    };
  }, [multiplier]);


  const getWinnerText = () => {
    if (store.winningPlayerId) return `${store.playerStates[store.winningPlayerId].playerName} の勝利！`;
    return '引き分け';
  };

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


  return (
    <MainContainer>
      <CanvasContainer>
        <Canvas camera={{ position: [0, 15, 14], fov: 70 }}>
          <color attach="background" args={['#5d4037']} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <GameBoard3D fieldState={store.gameField} />

          {/* ✨ debugSettingsオブジェクトを渡す */}
          <Hand3D
            player="alien_side"
            cards={alienCards}
            isVisible={isAlienHandVisible}
            currentPage={alienHandPage}
            onPageChange={setAlienHandPage}
            debugSettings={debugSettings}
          />
          <Hand3D
            player="native_side"
            cards={nativeCards}
            isVisible={isNativeHandVisible}
            currentPage={nativeHandPage}
            onPageChange={setNativeHandPage}
            debugSettings={debugSettings}
          />

          <OrbitControls makeDefault enableZoom={false} enableRotate={false} enablePan={false} />
          <SceneController />
        </Canvas>
      </CanvasContainer>

      {store.isGameOver && <GameOverScreen><h2>Game Over</h2><p>{getWinnerText()}</p></GameOverScreen>}

      <SidePanel className="right">
        <GameInfo />
        <button onClick={() => setAlienHandVisible(v => !v)}>
          {isAlienHandVisible ? 'Hide Hand' : 'Show Hand'}
        </button>
        <button onClick={store.progressTurn} disabled={store.isGameOver || store.activePlayerId !== 'alien_side'}>End Turn</button>
      </SidePanel>

      <SidePanel className="left">
        <GameInfo />
        <button onClick={() => setNativeHandVisible(v => !v)}>
          {isNativeHandVisible ? 'Hide Hand' : 'Show Hand'}
        </button>
        <button onClick={store.progressTurn} disabled={store.isGameOver || store.activePlayerId !== 'native_side'}>End Turn</button>
      </SidePanel>

      {/* ✨ debugSettingsオブジェクトとセッターを渡す */}
      <DebugDialog
        debugSettings={debugSettings}
        onSetDebugSettings={setDebugSettings}
        cardMultiplier={multiplier}
        onSetCardMultiplier={setMultiplier}
        players={[
          { name: 'Alien Side', currentPage: alienHandPage, maxPage: alienPageHandlers.maxPage, onNext: alienPageHandlers.handleNext, onPrev: alienPageHandlers.handlePrev },
          { name: 'Native Side', currentPage: nativeHandPage, maxPage: nativePageHandlers.maxPage, onNext: nativePageHandlers.handleNext, onPrev: nativePageHandlers.handlePrev },
        ]}
      />
    </MainContainer>
  );
}

export default App;