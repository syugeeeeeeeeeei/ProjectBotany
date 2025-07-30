import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import styled from 'styled-components';
import GameBoard3D from './components/GameBoard3D';
import GameInfo from './components/GameInfo';
import PlayerHand3D from './components/PlayerHand3D';
import SceneController from './components/SceneController';
import { cardMasterData, useGameStore } from './store/gameStore';

const MainContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative; // 子要素のabsoluteの基準点
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

// ✨ SidePanelがCanvasの上に浮かぶように position: absolute を使用
const SidePanel = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 250px; // 幅を少し広げる
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background-color: #00000050; // 背景を少し濃くして視認性を上げる
  color: white;
  border-radius: 10px;
  pointer-events: auto;
  z-index: 10; // Canvasより手前に表示

  &.left {
    left: 20px;
    transform: translateY(-50%) rotate(180deg);
  }
  &.right {
    right: 20px;
  }
`;

const HandControls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  pointer-events: auto;
  z-index: 20;
`;

const GameOverScreen = styled.div`
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.8); color: white;
  display: flex; justify-content: center; align-items: center;
  flex-direction: column; font-size: 2em; z-index: 100;
`;

function App() {
  const store = useGameStore();
  const hand = cardMasterData;

  const getWinnerText = () => {
    if (store.winningPlayerId) return `${store.playerStates[store.winningPlayerId].playerName} の勝利！`;
    return '引き分け';
  };

  return (
    <MainContainer>
      <CanvasContainer>
        <Canvas camera={{ position: [0, 15, 14], fov: 70 }}>
          <color attach="background" args={['#5d4037']} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <GameBoard3D fieldState={store.gameField} />
          <PlayerHand3D cards={hand} />
          <OrbitControls makeDefault enableZoom={false} enableRotate={false} enablePan={false} />
          <SceneController />
        </Canvas>
      </CanvasContainer>

      {store.isGameOver && <GameOverScreen><h2>Game Over</h2><p>{getWinnerText()}</p></GameOverScreen>}

      {/* --- 右側UI (自分: 外来種サイド) --- */}
      <SidePanel className="right">
        <GameInfo />
        <button onClick={store.progressTurn} disabled={store.isGameOver || store.activePlayerId !== 'alien_side'}>End Turn</button>
      </SidePanel>

      {/* --- 左側UI (相手: 在来種サイド) --- */}
      <SidePanel className="left">
        <GameInfo />
        <button onClick={store.progressTurn} disabled={store.isGameOver || store.activePlayerId !== 'native_side'}>End Turn</button>
      </SidePanel>

      <HandControls>
        <button onClick={store.toggleHandVisibility}>{store.isHandVisible ? 'Hide' : 'Show'}</button>
      </HandControls>
    </MainContainer>
  );
}

export default App;