import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
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

const TestControls = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff20;
  padding: 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: white;
  z-index: 20;
  pointer-events: auto;
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

  // useMemoを使って、倍率が変更されたときだけダミー手札を再生成
  const { alienCards, nativeCards } = useMemo(() => {
    const generateDummyCards = (type: 'alien' | 'native') => {
      const baseCards = cardMasterData.filter(
        c => type === 'alien' ? c.cardType === 'alien' : c.cardType !== 'alien'
      );
      // カードを複製する際に、一意なinstanceIdを付与する
      return Array.from({ length: multiplier }).flatMap((_, i) =>
        baseCards.map(card => ({
          ...card,
          instanceId: `${card.id}-instance-${i}` // 元のIDとインデックスを組み合わせてユニークIDを生成
        }))
      );
    };
    return {
      alienCards: generateDummyCards('alien'),
      nativeCards: generateDummyCards('native'),
    };
  }, [multiplier]);


  const [isAlienHandVisible, setAlienHandVisible] = useState(true);
  const [isNativeHandVisible, setNativeHandVisible] = useState(true);

  const getWinnerText = () => {
    if (store.winningPlayerId) return `${store.playerStates[store.winningPlayerId].playerName} の勝利！`;
    return '引き分け';
  };

  return (
    <MainContainer>
      <TestControls>
        <span>カード枚数:</span>
        <button onClick={() => setMultiplier(m => Math.max(1, m - 1))}>-</button>
        <span>x{multiplier} ({alienCards.length}枚)</span>
        <button onClick={() => setMultiplier(m => m + 1)}>+</button>
      </TestControls>

      <CanvasContainer>
        <Canvas camera={{ position: [0, 15, 14], fov: 70 }}>
          <color attach="background" args={['#5d4037']} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <GameBoard3D fieldState={store.gameField} />

          <Hand3D
            player="alien_side"
            cards={alienCards}
            isVisible={isAlienHandVisible}
          />
          <Hand3D
            player="native_side"
            cards={nativeCards}
            isVisible={isNativeHandVisible}
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

    </MainContainer>
  );
}

export default App;