/**
 * @file App.tsx
 * @description アプリケーションのエントリポイントとなるメインコンポーネントです。
 * 3Dレンダリング（React Three Fiber）と2D UI（styled-components）を統合し、
 * ゲームのライフサイクル、ターン管理、通知システム、デバッグ設定を一括して制御します。
 *
 * 【動機】
 * ゲーム全体の状態（Store）とUI表現（Canvas/HTML）を橋渡しするハブとして機能させるためです。
 * 複雑なゲームの進行（ターン開始、終了、通知の消去など）を副作用（useEffect）として一箇所で定義することで、
 * 整合性を保ちつつ各コンポーネントに反映させることを意図しています。
 *
 * 【恩恵】
 * - 3Dシーンと2Dオーバーレイが分離・統合されているため、レイヤーごとの管理が容易になります。
 * - グローバルなスタイル設定や、画面ロック（ターン切り替え時）などの共通機能を一括適用できます。
 * - ゲームの開始、リセット、ターンの進行に合わせたUIの動的な切り替えが自動化されます。
 *
 * 【使用法】
 * `main.tsx` から呼び出され、アプリケーション全体をラップします。
 * 内部では `useGameStore` や `useUIStore` を通じてゲームの状態を監視し、
 * 各機能モジュール（Features）へ必要なデータとコールバックを分配します。
 */

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";

// Shared
import {
  DebugDialog,
  type DebugSettings,
} from "@/shared/components/debug/DebugDialog";
import SceneController from "@/shared/components/3d/SceneController";
import type { CardDefinition, PlayerType } from "@/shared/types/game-schema";
import { useFullscreenHeight } from "@/shared/hooks/useFullscreenHeight";

// Features
import { GameBoard3D } from "@/features/field-grid";
import { Hand3D } from "@/features/card-hand";
import { GameInfo, UIOverlay } from "@/features/hud";
import { ActionButtons } from "@/features/play-card";
import { TurnEndButton } from "@/features/turn-system";

// Stores
import cardMasterData from "@/data/cardMasterData";
import { useGameStore } from "@/app/store/useGameStore";
import { useUIStore } from "@/app/store/useUIStore";

const GLOBAL_STYLES = { BACKGROUND_COLOR: "#50342b" };
const LAYOUT = {
  SIDE_PANEL_WIDTH: "120px",
  SIDE_PANEL_GAP: "20px",
  SIDE_PANEL_OFFSET: "5px",
};
const CAMERA_SETTINGS = {
  POSITION: [0, 15, 14] as [number, number, number],
  FOV: 70,
};
const LIGHT_SETTINGS = {
  AMBIENT_INTENSITY: 0.8,
  DIRECTIONAL_POSITION: [10, 10, 5] as [number, number, number],
  DIRECTIONAL_INTENSITY: 1,
};
const TIMERS = {
  TURN_BANNER_DELAY: 1000,
  TURN_BANNER_DURATION: 2000,
  NOTIFICATION_DURATION: 3000,
};
const HAND_PAGING_CONFIG = { CARDS_PER_PAGE: 3 };

const GlobalStyle = createGlobalStyle`
  html, body { margin: 0; padding: 0; width: 100%; height: 100vh; overflow: hidden; background-color: ${GLOBAL_STYLES.BACKGROUND_COLOR}; overscroll-behavior: none; }
  #root { width: 100%; height: 100%; }
  body { user-select: none; -webkit-user-select: none; }
`;

const MainContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  pointer-events: none;
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
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      transform: rotate(180deg);
    }
  }
  &.right {
    right: ${LAYOUT.SIDE_PANEL_OFFSET};
    & > .content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
  }
`;
const ScreenLockOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
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

function App() {
  useFullscreenHeight();
  const game = useGameStore();
  const ui = useUIStore();

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showTurnBanner, setShowTurnBanner] = useState(false);
  const [isStartingTurn, setIsStartingTurn] = useState(false);
  const [isAlienHandManuallyVisible, setAlienHandManuallyVisible] =
    useState(true);
  const [isNativeHandManuallyVisible, setNativeHandManuallyVisible] =
    useState(true);
  const [alienHandPage, setAlienHandPage] = useState(0);
  const [nativeHandPage, setNativeHandPage] = useState(0);

  const [debugSettings, setDebugSettings] = useState<DebugSettings>({
    isGestureAreaVisible: false,
    flickDistanceRatio: 0.25,
    flickVelocityThreshold: 0.2,
    swipeAreaHeight: 4,
  });

  // ターン開始・切り替え時の演出（バナー表示と操作ロック）を制御する副作用
  // プレイヤーにターンの交代を明示し、誤操作を防ぐために必要です
  useEffect(() => {
    if (!isGameStarted || game.isGameOver) return;
    setIsStartingTurn(true);
    const timer = setTimeout(() => {
      setShowTurnBanner(true);
      setIsStartingTurn(false);
    }, TIMERS.TURN_BANNER_DELAY);
    return () => clearTimeout(timer);
  }, [game.activePlayerId, game.currentTurn, isGameStarted, game.isGameOver]);

  // ターンバナーを一定時間後に自動で非表示にする副作用
  // 画面中央を塞ぎ続けないようにするために必要です
  useEffect(() => {
    if (showTurnBanner) {
      const timer = setTimeout(
        () => setShowTurnBanner(false),
        TIMERS.TURN_BANNER_DURATION,
      );
      return () => clearTimeout(timer);
    }
  }, [showTurnBanner]);

  // 外来種側の通知を一定時間後に消去する副作用
  // 画面上に通知が残り続けるのを防ぎ、UXを向上させるために必要です
  useEffect(() => {
    if (ui.notifications.alien) {
      const timer = setTimeout(
        () => ui.setNotification(null, "alien"),
        TIMERS.NOTIFICATION_DURATION,
      );
      return () => clearTimeout(timer);
    }
  }, [ui.notifications.alien, ui]);

  // 在来種側の通知を一定時間後に消去する副作用
  useEffect(() => {
    if (ui.notifications.native) {
      const timer = setTimeout(
        () => ui.setNotification(null, "native"),
        TIMERS.NOTIFICATION_DURATION,
      );
      return () => clearTimeout(timer);
    }
  }, [ui.notifications.native, ui]);

  // 全カードマスターデータから、各プレイヤーの初期デック（複製済みインスタンス）を生成
  // ゲーム開始時に各カードに一意なIDを付与し、手札として扱えるようにするために必要です
  const { alienCards, nativeCards } = useMemo(() => {
    const duplicate = (cards: CardDefinition[]) =>
      cards.flatMap((card) =>
        Array.from({ length: card.deckCount }).map((_, i) => ({
          ...card,
          instanceId: `${card.id}-instance-${i}`,
        })),
      );

    const alien = duplicate(
      cardMasterData.filter((c) => c.cardType === "alien"),
    ).sort((a, b) => a.cost - b.cost);

    const eradication = duplicate(
      cardMasterData.filter((c) => c.cardType === "eradication"),
    ).sort((a, b) => a.cost - b.cost);
    const recovery = duplicate(
      cardMasterData.filter((c) => c.cardType === "recovery"),
    ).sort((a, b) => a.cost - b.cost);
    const native = [...eradication, ...recovery];

    return { alienCards: alien, nativeCards: native };
  }, []);

  /**
   * UIオーバーレイに渡す表示情報をプレイヤーごとに生成する
   * 対面プレイ時に、それぞれの向きに合わせたメッセージ（勝利・敗北・ターン等）を出すために必要です
   */
  const getOverlayProps = (thisPlayerId: PlayerType) => {
    if (!isGameStarted)
      return {
        show: true,
        message: "Project Botany",
        buttonText: "Start Game",
        onButtonClick: () => setIsGameStarted(true),
      };

    // 共通のスコア情報
    const scoreInfo = {
      native: game.nativeScore,
      alien: game.alienScore,
      total: game.gameField.width * game.gameField.height,
    };

    if (game.isGameOver) {
      const sub =
        game.winningPlayerId === thisPlayerId
          ? "あなたの勝利！"
          : game.winningPlayerId === null
            ? "引き分け"
            : "あなたの敗北";
      return {
        show: true,
        message: "Game Over",
        subMessage: sub,
        buttonText: "Play Again",
        scoreInfo, // スコアを表示
        onButtonClick: () => {
          game.resetGame();
          setIsGameStarted(false);
          setAlienHandPage(0);
          setNativeHandPage(0);
          setAlienHandManuallyVisible(true);
          setNativeHandManuallyVisible(true);
          ui.setNotification(null, "alien");
          ui.setNotification(null, "native");
        },
      };
    }

    if (showTurnBanner) {
      const role =
        game.activePlayerId === thisPlayerId ? "(あなた)" : "(あいて)";
      return {
        show: true,
        message: `Turn ${game.currentTurn}/${game.maximumTurns}\n${game.playerStates[game.activePlayerId].playerName} ${role} のターン`,
        scoreInfo, // スコアを表示
      };
    }

    const playerNotification = ui.notifications[thisPlayerId];
    if (playerNotification)
      return {
        show: true,
        message: playerNotification,
        isDismissible: true,
        onDismiss: () => ui.setNotification(null, thisPlayerId),
      };

    return { show: false, message: "" };
  };

  const maxAlienPage =
    Math.ceil(alienCards.length / HAND_PAGING_CONFIG.CARDS_PER_PAGE) - 1;
  const maxNativePage =
    Math.ceil(nativeCards.length / HAND_PAGING_CONFIG.CARDS_PER_PAGE) - 1;

  // 何らかのオブジェクト（カードまたは配置済み個体）が選択中かどうか
  const isSelecting = !!(ui.selectedCardId || ui.selectedAlienInstanceId);
  const isAlienHandActuallyVisible =
    isAlienHandManuallyVisible &&
    game.activePlayerId === "alien" &&
    !isSelecting;
  const isNativeHandActuallyVisible =
    isNativeHandManuallyVisible &&
    game.activePlayerId === "native" &&
    !isSelecting;

  // デバッグ用UIに渡すパラメータとトグルコールバック
  // 開発中の微調整や、モバイル実機でのテストを円滑にするために必要です
  const debugDialogProps = {
    debugSettings,
    onSetDebugSettings: setDebugSettings,
    players: [
      {
        name: "Alien Side",
        currentPage: alienHandPage,
        maxPage: maxAlienPage,
        onNext: () => setAlienHandPage((p) => Math.min(p + 1, maxAlienPage)),
        onPrev: () => setAlienHandPage((p) => Math.max(0, p - 1)),
      },
      {
        name: "Native Side",
        currentPage: nativeHandPage,
        maxPage: maxNativePage,
        onNext: () => setNativeHandPage((p) => Math.min(p + 1, maxNativePage)),
        onPrev: () => setNativeHandPage((p) => Math.max(0, p - 1)),
      },
    ],
    isAlienHandVisible: isAlienHandActuallyVisible,
    onToggleAlienHand: () => setAlienHandManuallyVisible((v) => !v),
    isNativeHandVisible: isNativeHandActuallyVisible,
    onToggleNativeHand: () => setNativeHandManuallyVisible((v) => !v),
  };

  return (
    <>
      <GlobalStyle />
      {isStartingTurn && <ScreenLockOverlay />}
      <DebugContainer>
        <DebugDialog
          {...debugDialogProps}
          cardMultiplier={1}
          onSetCardMultiplier={() => {}}
        />
      </DebugContainer>
      <MainContainer>
        <UIOverlay {...getOverlayProps("alien")} side="bottom" />
        <UIOverlay {...getOverlayProps("native")} side="top" />
        <CanvasContainer>
          <Canvas
            shadows
            camera={{
              position: CAMERA_SETTINGS.POSITION,
              fov: CAMERA_SETTINGS.FOV,
            }}
          >
            <color
              attach="background"
              args={[GLOBAL_STYLES.BACKGROUND_COLOR]}
            />
            <ambientLight intensity={LIGHT_SETTINGS.AMBIENT_INTENSITY} />
            <directionalLight
              position={LIGHT_SETTINGS.DIRECTIONAL_POSITION}
              intensity={LIGHT_SETTINGS.DIRECTIONAL_INTENSITY}
            />
            <GameBoard3D fieldState={game.gameField} />
            <Hand3D
              player="alien"
              cards={alienCards}
              isVisible={isAlienHandActuallyVisible}
              onVisibilityChange={setAlienHandManuallyVisible}
              currentPage={alienHandPage}
              onPageChange={setAlienHandPage}
              debugSettings={debugSettings}
              isInteractionLocked={isSelecting}
            />
            <Hand3D
              player="native"
              cards={nativeCards}
              isVisible={isNativeHandActuallyVisible}
              onVisibilityChange={setNativeHandManuallyVisible}
              currentPage={nativeHandPage}
              onPageChange={setNativeHandPage}
              debugSettings={debugSettings}
              isInteractionLocked={isSelecting}
            />
            <OrbitControls
              makeDefault
              enableZoom={false}
              enableRotate={false}
              enablePan={false}
            />
            <SceneController />
          </Canvas>
        </CanvasContainer>
        <SidePanel className="right">
          <div className="content">
            <GameInfo player="alien" />
            {ui.isCardPreview && game.activePlayerId === "alien" ? (
              <ActionButtons />
            ) : (
              <TurnEndButton player="alien" />
            )}
          </div>
        </SidePanel>
        <SidePanel className="left">
          <div className="content">
            <GameInfo player="native" />
            {ui.isCardPreview && game.activePlayerId === "native" ? (
              <ActionButtons />
            ) : (
              <TurnEndButton player="native" />
            )}
          </div>
        </SidePanel>
      </MainContainer>
    </>
  );
}

export default App;
