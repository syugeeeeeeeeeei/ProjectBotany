import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { DebugDialog, type DebugSettings } from './components/DebugDialog';
import GameBoard3D from './components/GameBoard3D';
import GameInfo from './components/GameInfo';
import Hand3D from './components/Hand3D';
import SceneController from './components/SceneController';
import UIOverlay from './components/UIOverlay';
import cardMasterData from './store/cardMasterData';
import { useGameStore } from './store/gameStore';
import type { PlayerId } from './types/data';

// --- 定数定義 ---

/** グローバルスタイル設定 */
const GLOBAL_STYLES = {
  BACKGROUND_COLOR: '#50342b',
};

/** UIレイアウト設定 */
const LAYOUT = {
  SIDE_PANEL_WIDTH: '120px',
  SIDE_PANEL_GAP: '20px',
  SIDE_PANEL_OFFSET: '5px',
};

/** カメラ設定 */
const CAMERA_SETTINGS = {
  POSITION: [0, 15, 14] as [number, number, number],
  FOV: 70,
};

/** ライト設定 */
const LIGHT_SETTINGS = {
  AMBIENT_INTENSITY: 0.8,
  DIRECTIONAL_POSITION: [10, 10, 5] as [number, number, number],
  DIRECTIONAL_INTENSITY: 1,
};

/** ゲームロジック・アニメーション関連のタイマー設定 (ms) */
const TIMERS = {
  TURN_BANNER_DELAY: 1000,
  TURN_BANNER_DURATION: 2000,
  NOTIFICATION_DURATION: 3000,
};

/** 手札のページング設定 */
const HAND_PAGING = {
  CARDS_PER_PAGE: 4,
};


// --- スタイル定義 ---

const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: ${GLOBAL_STYLES.BACKGROUND_COLOR};
    overscroll-behavior: none;
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
  width: ${LAYOUT.SIDE_PANEL_WIDTH};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${LAYOUT.SIDE_PANEL_GAP};
  color: white;
  pointer-events: auto;
  z-index: 10;
  font-family: sans-serif;

  &.left {
    left: ${LAYOUT.SIDE_PANEL_OFFSET};
    & > .content {
      display: flex; flex-direction: column;
      align-items: center; gap: 10px;
      transform: rotate(180deg);
    }
  }
  &.right {
    right: ${LAYOUT.SIDE_PANEL_OFFSET};
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

const ScreenLockOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background-color: transparent;
`;

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
  width: 100%;

  &:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(1px) scale(0.98);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    background: #757575;
    color: #bdbdbd;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
    opacity: 0.7;
  }
`;

/**
 * アプリケーションのメインコンポーネント。
 * 全体のレイアウト、状態管理、3Dシーンのレンダリングを担当する。
 */
function App() {
  // --- StateとStore ---
  const store = useGameStore();
  const { selectedCardId, selectedAlienInstanceId, notification, setNotification, resetGame } = store;

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showTurnBanner, setShowTurnBanner] = useState(false);
  const [isStartingTurn, setIsStartingTurn] = useState(false);

  // --- Debug関連State ---
  const [multiplier, setMultiplier] = useState(1);
  const [alienHandPage, setAlienHandPage] = useState(0);
  const [nativeHandPage, setNativeHandPage] = useState(0);
  const [isAlienHandVisible, setAlienHandVisible] = useState(true);
  const [isNativeHandVisible, setNativeHandVisible] = useState(true);
  const [debugSettings, setDebugSettings] = useState<DebugSettings>({
    isGestureAreaVisible: false,
    flickDistanceRatio: 0.25,
    flickVelocityThreshold: 0.2,
    swipeAreaHeight: 4,
  });

  // --- Ref ---
  const handVisibilityBeforeSelect = useRef({ alien: true, native: true });
  const prevSelectedCardId = useRef<string | null>(null);

  // --- エフェクトフック ---

  /**
   * カードやエイリアンの選択状態に応じて、手札の表示/非表示を自動的に切り替える。
   * - 何かが選択されたら、両プレイヤーの手札を非表示にする。
   * - 選択が解除されたら、選択前の表示状態に復元する。
   */
  useEffect(() => {
    // 初めてカードが選択された瞬間の手札表示状態を保存
    if (!prevSelectedCardId.current && selectedCardId) {
      handVisibilityBeforeSelect.current = { alien: isAlienHandVisible, native: isNativeHandVisible };
    }
    prevSelectedCardId.current = selectedCardId; // 現在の選択状態を次回のために保存

    if (selectedCardId || selectedAlienInstanceId) {
      setAlienHandVisible(false);
      setNativeHandVisible(false);
    } else {
      setAlienHandVisible(handVisibilityBeforeSelect.current.alien);
      setNativeHandVisible(handVisibilityBeforeSelect.current.native);
    }
  }, [selectedCardId, selectedAlienInstanceId]);


  /**
   * ターン開始時にアニメーションとUIの表示を制御する。
   */
  useEffect(() => {
    if (!isGameStarted || store.isGameOver) return;
    // ターン開始直後は操作をロック
    setIsStartingTurn(true);
    // 少し遅れてターン表示バナーを出す
    const timer = setTimeout(() => {
      setShowTurnBanner(true);
      setIsStartingTurn(false);
    }, TIMERS.TURN_BANNER_DELAY);
    return () => clearTimeout(timer);
  }, [store.activePlayerId, store.currentTurn, isGameStarted, store.isGameOver]);

  /**
   * ターン表示バナーを一定時間後に自動で非表示にする。
   */
  useEffect(() => {
    if (showTurnBanner) {
      const timer = setTimeout(() => { setShowTurnBanner(false); }, TIMERS.TURN_BANNER_DURATION);
      return () => clearTimeout(timer);
    }
  }, [showTurnBanner]);

  /**
   * 通知メッセージを一定時間後に自動で非表示にする。
   */
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), TIMERS.NOTIFICATION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);


  // --- メモ化された値 ---

  /** カードマスターデータと倍率に基づき、各プレイヤーが使用するカードのリストを生成する */
  const { alienCards, nativeCards } = useMemo(() => {
    const generatePlayerCards = (playerType: 'alien' | 'native') => {
      const filterCondition = (c: typeof cardMasterData[0]) =>
        playerType === 'alien' ? c.cardType === 'alien' : c.cardType !== 'alien';
      const baseCards = cardMasterData.filter(filterCondition);
      // multiplierに応じてカードを複製し、ユニークなinstanceIdを付与
      return Array.from({ length: multiplier }).flatMap((_, i) =>
        baseCards.map(card => ({ ...card, instanceId: `${card.id}-instance-${i}` }))
      );
    };
    return {
      alienCards: generatePlayerCards('alien'),
      nativeCards: generatePlayerCards('native')
    };
  }, [multiplier]);


  // --- ヘルパー関数 ---

  /**
   * ゲームの状況に応じて、UIオーバーレイに表示する内容を決定する。
   * @param thisPlayerId オーバーレイを表示する対象のプレイヤーID
   */
  const getOverlayProps = (thisPlayerId: PlayerId) => {
    const { isGameOver, winningPlayerId, activePlayerId, currentTurn, playerStates } = store;
    const isMyTurn = activePlayerId === thisPlayerId;

    if (!isGameStarted) {
      return { show: true, message: 'Project Botany', buttonText: 'Start Game', onButtonClick: () => setIsGameStarted(true) };
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


  /**
   * ページング操作のためのハンドラを生成する。
   */
  const createPageHandlers = (
    page: number,
    setPage: React.Dispatch<React.SetStateAction<number>>,
    cardsLength: number
  ) => {
    const maxPage = Math.ceil(cardsLength / HAND_PAGING.CARDS_PER_PAGE) - 1;
    return {
      handleNext: () => setPage(p => Math.min(p + 1, maxPage)),
      handlePrev: () => setPage(p => Math.max(p - 1, 0)),
      maxPage
    };
  };

  // --- Propの準備 ---

  const alienOverlayProps = getOverlayProps('alien_side');
  const nativeOverlayProps = getOverlayProps('native_side');

  const alienPageHandlers = createPageHandlers(alienHandPage, setAlienHandPage, alienCards.length);
  const nativePageHandlers = createPageHandlers(nativeHandPage, setNativeHandPage, nativeCards.length);

  const debugDialogProps = {
    debugSettings,
    onSetDebugSettings: setDebugSettings,
    cardMultiplier: multiplier,
    onSetCardMultiplier: setMultiplier,
    players: [
      { name: 'Alien Side', currentPage: alienHandPage, maxPage: alienPageHandlers.maxPage, onNext: alienPageHandlers.handleNext, onPrev: alienPageHandlers.handlePrev },
      { name: 'Native Side', currentPage: nativeHandPage, maxPage: nativePageHandlers.maxPage, onNext: nativePageHandlers.handleNext, onPrev: nativePageHandlers.handlePrev },
    ],
    isAlienHandVisible,
    onToggleAlienHand: () => setAlienHandVisible(v => !v),
    isNativeHandVisible,
    onToggleNativeHand: () => setNativeHandVisible(v => !v),
  };

  // カード選択時やエイリアン選択時は手札の操作をロック
  const isHandInteractionLocked = !!selectedCardId || !!selectedAlienInstanceId;


  // --- レンダリング ---
  return (
    <>
      <GlobalStyle />
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
          <Canvas shadows camera={{ position: CAMERA_SETTINGS.POSITION, fov: CAMERA_SETTINGS.FOV }}>
            <color attach="background" args={[GLOBAL_STYLES.BACKGROUND_COLOR]}/>
            <ambientLight intensity={LIGHT_SETTINGS.AMBIENT_INTENSITY} />
            <directionalLight
              position={LIGHT_SETTINGS.DIRECTIONAL_POSITION}
              intensity={LIGHT_SETTINGS.DIRECTIONAL_INTENSITY}
            />
            <GameBoard3D fieldState={store.gameField} />
            <Hand3D
              key='alien-hand'
              player="alien_side"
              cards={alienCards}
              isVisible={isAlienHandVisible}
              onVisibilityChange={setAlienHandVisible}
              currentPage={alienHandPage}
              onPageChange={setAlienHandPage}
              debugSettings={debugSettings}
              isInteractionLocked={isHandInteractionLocked}
            />
            <Hand3D
              key='native-hand'
              player="native_side"
              cards={nativeCards}
              isVisible={isNativeHandVisible}
              onVisibilityChange={setNativeHandVisible}
              currentPage={nativeHandPage}
              onPageChange={setNativeHandPage}
              debugSettings={debugSettings}
              isInteractionLocked={isHandInteractionLocked}
            />
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